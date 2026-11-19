const AI_GROUP = "🤖 AI";
const US_GROUP = "🇺🇸 美国节点";

const US_NODE_FILTER =
  "(?i)美国|美國|美西|美东|美東|🇺🇸|(^|[^a-z0-9])(?:USA?[0-9]*|United[ _-]+States|Los[ _-]+Angeles|San[ _-]+Jose|Seattle|New[ _-]+York)(?=$|[^a-z0-9])";
const NOTICE_FILTER =
  "(?i)流量|剩余|剩餘|到期|过期|過期|有效期|官网|官網|网址|網址|订阅|訂閱|续费|續費|套餐|重置|客服|群组|群組|公告|(^|[^a-z0-9])(?:traffic|remaining|expir(?:e[sd]?|y|ation)|official[ _-]+(?:site|website)|subscription|data[ _-]+left|bandwidth[ _-]+left)(?=$|[^a-z0-9])";

const US_HEALTH_CHECK = {
  url: "https://www.gstatic.com/generate_204",
  interval: 300,
  tolerance: 50,
  lazy: true,
};

const RULE_INTERVAL = 86400;
const RULE_PREFIX = "AIrules-";
const UPSTREAM = "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash";
const AI_RULE_SOURCES = {
  OpenAI: `${UPSTREAM}/OpenAI/OpenAI.yaml`,
  Claude: `${UPSTREAM}/Claude/Claude.yaml`,
  BardAI: `${UPSTREAM}/BardAI/BardAI.yaml`,
  Gemini: `${UPSTREAM}/Gemini/Gemini.yaml`,
  "AI-Supplement": "https://raw.githubusercontent.com/ukonic/AIrules/main/AI-Supplement.yaml",
};

function updateProxyGroups(config) {
  const usGroup = Object.assign({
    name: US_GROUP,
    type: "url-test",
    "include-all": true,
    filter: US_NODE_FILTER,
    "exclude-filter": NOTICE_FILTER,
    "exclude-type": "Direct|Compatible|Dns|Reject|RejectDrop|Pass|PassRule",
    "empty-fallback": "REJECT",
  }, US_HEALTH_CHECK);
  const managedGroups = new Map([
    [AI_GROUP, { name: AI_GROUP, type: "select", proxies: [US_GROUP] }],
    [US_GROUP, usGroup],
  ]);

  // Preserve the position of the first occurrence and remove duplicate managed groups.
  const groups = [];
  for (const group of config["proxy-groups"] || []) {
    if (group.name !== AI_GROUP && group.name !== US_GROUP) {
      groups.push(group);
    } else if (managedGroups.has(group.name)) {
      groups.push(managedGroups.get(group.name));
      managedGroups.delete(group.name);
    }
  }
  return groups.concat(Array.from(managedGroups.values()));
}

function registerRuleProvider(providers, source, url) {
  const definition = {
    type: "http",
    behavior: "classical",
    format: "yaml",
    interval: RULE_INTERVAL,
    url,
  };
  const keys = Object.keys(definition);
  const baseName = RULE_PREFIX + source;
  let name = baseName;
  let suffix = 2;

  while (Object.prototype.hasOwnProperty.call(providers, name)) {
    const existing = providers[name];
    if (existing && Object.keys(existing).length === keys.length &&
        keys.every(key => existing[key] === definition[key])) {
      return name;
    }
    name = `${baseName}-${suffix}`;
    suffix += 1;
  }
  providers[name] = definition;
  return name;
}

function main(config, profileName) {
  const groupNames = [AI_GROUP, US_GROUP];
  const proxyProviders = config["proxy-providers"] || {};
  for (const name of groupNames) {
    if ((config.proxies || []).some(proxy => proxy.name === name) ||
        Object.prototype.hasOwnProperty.call(proxyProviders, name)) {
      throw new Error(`AIrules: 代理节点或代理提供者与策略组同名：${name}`);
    }
  }

  const groups = updateProxyGroups(config);
  const providers = config["rule-providers"] || {};
  const aiRules = Object.keys(AI_RULE_SOURCES).map(source => {
    const name = registerRuleProvider(providers, source, AI_RULE_SOURCES[source]);
    return `RULE-SET,${name},${AI_GROUP}`;
  });
  const aiRuleSet = new Set(aiRules);
  const existingRules = (config.rules || []).filter(rule =>
    !aiRuleSet.has(rule.split(",").map(field => field.trim()).join(","))
  );

  config["proxy-groups"] = groups;
  config["rule-providers"] = providers;
  config.rules = aiRules.concat(existingRules);
  return config;
}

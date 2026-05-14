import { computed, createApp, onMounted, ref, watch } from "vue/dist/vue.esm-bundler.js";
import "./styles.css";

const pad = (num) => String(num).padStart(2, "0");
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const digitSum = (num) => String(num).split("").reduce((sum, n) => sum + Number(n), 0);
const unique = (items) => Array.from(new Set(items));

const zodiacs = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

const lunarNewYearDates = {
  "2020": "2020-01-25",
  "2021": "2021-02-12",
  "2022": "2022-02-01",
  "2023": "2023-01-22",
  "2024": "2024-02-10",
  "2025": "2025-01-29",
  "2026": "2026-02-17",
  "2027": "2027-02-06",
  "2028": "2028-01-26",
  "2029": "2029-02-13",
  "2030": "2030-02-03",
  "2031": "2031-01-23",
  "2032": "2032-02-11",
  "2033": "2033-01-31",
  "2034": "2034-02-19",
  "2035": "2035-02-08",
  "2036": "2036-01-28",
  "2037": "2037-02-15",
  "2038": "2038-02-04",
  "2039": "2039-01-24",
  "2040": "2040-02-12"
};

const nayinElements = [
  "金", "金", "火", "火", "木", "木", "土", "土", "金", "金",
  "火", "火", "水", "水", "土", "土", "金", "金", "木", "木",
  "水", "水", "土", "土", "火", "火", "木", "木", "水", "水",
  "金", "金", "火", "火", "木", "木", "土", "土", "金", "金",
  "火", "火", "水", "水", "土", "土", "金", "金", "木", "木",
  "水", "水", "土", "土", "火", "火", "木", "木", "水", "水"
];

const redWave = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46];
const greenWave = [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49];
const blueWave = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48];
const waveColorMap = Object.fromEntries([
  ...redWave.map((num) => [num, "red-wave"]),
  ...greenWave.map((num) => [num, "green-wave"]),
  ...blueWave.map((num) => [num, "blue-wave"])
]);

const aliasMap = {
  "单": "单数",
  "双": "双数",
  "大": "大数",
  "小": "小数",
  "家畜": "家禽",
  "家禽": "家禽",
  "红": "红波",
  "绿": "绿波",
  "蓝": "蓝波",
  "兰": "蓝波",
  "龍": "龙",
  "馬": "马",
  "雞": "鸡",
  "豬": "猪"
};

const tokenGroups = [
  ["鼠", "牛", "虎", "兔", "龙", "蛇"],
  ["马", "羊", "猴", "鸡", "狗", "猪"],
  ["家禽", "野兽", "单数", "双数", "大数", "小数"],
  ["大单", "小单", "大双", "小双", "合单", "合双"],
  ["合大", "合小", "红波", "蓝波", "绿波", "红单"],
  ["红双", "蓝单", "蓝双", "绿单", "绿双", "金"],
  ["木", "水", "火", "土", "0尾", "1尾"],
  ["2尾", "3尾", "4尾", "5尾", "6尾", "7尾"],
  ["8尾", "9尾", "0头单", "0头双", "1头单", "1头双"],
  ["2头单", "2头双", "3头单", "3头双", "4头单", "4头双"],
  ["0头", "1头", "2头", "3头", "4头", "1段"],
  ["2段", "3段", "4段", "5段", "6段", "7段"],
  ["1合", "2合", "3合", "4合", "5合", "6合"],
  ["7合", "8合", "9合", "10合", "11合", "12合"],
  ["13合"]
];

const allSelectableLabels = tokenGroups.flat();
const canonical = (label) => aliasMap[label] || label;

function currentLunarYear(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "long",
      day: "numeric"
    }).formatToParts(date);
    const relatedYear = parts.find((part) => part.type === "relatedYear")?.value;
    if (relatedYear) return relatedYear;
  } catch {
    // Fall back to the bundled Spring Festival table below.
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const today = `${value.year}-${value.month}-${value.day}`;
  const gregorianYear = Number(value.year);
  const newYearDate = lunarNewYearDates[gregorianYear];

  if (newYearDate) return today >= newYearDate ? String(gregorianYear) : String(gregorianYear - 1);
  return String(gregorianYear);
}

function currentYearZodiacIndex(year) {
  return ((Number(year) - 2020) % 12 + 12) % 12;
}

function buildZodiacNumbers(year) {
  const map = Object.fromEntries(zodiacs.map((name) => [name, []]));
  const yearIndex = currentYearZodiacIndex(year);

  range(1, 49).forEach((num) => {
    const zodiacIndex = (yearIndex - ((num - 1) % 12) + 12) % 12;
    map[zodiacs[zodiacIndex]].push(num);
  });

  return map;
}

function nayinElementForYear(year) {
  const index = ((Number(year) - 1984) % 60 + 60) % 60;
  return nayinElements[index];
}

function buildElementNumbers(year) {
  const result = { "金": [], "木": [], "水": [], "火": [], "土": [] };
  range(1, 49).forEach((num) => {
    const element = nayinElementForYear(Number(year) - num + 1);
    result[element].push(num);
  });
  return result;
}

function buildRuleMap(zodiacNumbers, elementNumbers) {
  const ruleMap = {};
  for (let i = 1; i <= 49; i += 1) ruleMap[pad(i)] = [i];
  Object.assign(ruleMap, zodiacNumbers, elementNumbers);

  ruleMap["家禽"] = ["牛", "马", "羊", "鸡", "狗", "猪"].flatMap((name) => zodiacNumbers[name]);
  ruleMap["野兽"] = ["鼠", "虎", "兔", "龙", "蛇", "猴"].flatMap((name) => zodiacNumbers[name]);
  ruleMap["单数"] = range(1, 49).filter((n) => n % 2 === 1);
  ruleMap["双数"] = range(1, 49).filter((n) => n % 2 === 0);
  ruleMap["大数"] = range(25, 49);
  ruleMap["小数"] = range(1, 24);
  ruleMap["大单"] = ruleMap["大数"].filter((n) => n % 2 === 1);
  ruleMap["小单"] = ruleMap["小数"].filter((n) => n % 2 === 1);
  ruleMap["大双"] = ruleMap["大数"].filter((n) => n % 2 === 0);
  ruleMap["小双"] = ruleMap["小数"].filter((n) => n % 2 === 0);
  ruleMap["合单"] = range(1, 49).filter((n) => digitSum(n) % 2 === 1);
  ruleMap["合双"] = range(1, 49).filter((n) => digitSum(n) % 2 === 0);
  ruleMap["合大"] = range(1, 49).filter((n) => digitSum(n) >= 7);
  ruleMap["合小"] = range(1, 49).filter((n) => digitSum(n) <= 6);
  ruleMap["红波"] = redWave;
  ruleMap["绿波"] = greenWave;
  ruleMap["蓝波"] = blueWave;

  for (const [label, nums] of Object.entries({ 红: redWave, 绿: greenWave, 蓝: blueWave })) {
    ruleMap[`${label}单`] = nums.filter((n) => n % 2 === 1);
    ruleMap[`${label}双`] = nums.filter((n) => n % 2 === 0);
  }

  for (let i = 0; i <= 9; i += 1) ruleMap[`${i}尾`] = range(1, 49).filter((n) => n % 10 === i);
  for (let i = 0; i <= 4; i += 1) ruleMap[`${i}头`] = range(1, 49).filter((n) => Math.floor(n / 10) === i);
  for (let i = 0; i <= 4; i += 1) {
    ruleMap[`${i}头单`] = ruleMap[`${i}头`].filter((n) => n % 2 === 1);
    ruleMap[`${i}头双`] = ruleMap[`${i}头`].filter((n) => n % 2 === 0);
  }

  for (let i = 1; i <= 7; i += 1) {
    const start = (i - 1) * 7 + 1;
    ruleMap[`${i}段`] = range(start, Math.min(start + 6, 49));
  }

  for (let i = 1; i <= 13; i += 1) {
    ruleMap[`${i}合`] = range(1, 49).filter((n) => digitSum(n) === i);
  }

  return ruleMap;
}

const chipTone = (label) => {
  if (zodiacs.includes(label)) return "purple";
  if (["家禽", "野兽", "合大", "合小", "金", "木", "水", "火", "土"].includes(label)) return "blue";
  if (["单数", "双数"].includes(label)) return "green";
  if (["大数", "小数"].includes(label)) return "mint";
  if (["大单", "小单", "大双", "小双"].includes(label)) return "gold";
  if (["合单", "合双"].includes(label)) return "red";
  if (["红波", "蓝波", "绿波"].includes(label)) return "earth";
  if (["红单", "红双", "蓝单", "蓝双", "绿单", "绿双"].includes(label)) return "magenta";
  if (label.includes("尾")) return "pink";
  if (label.includes("头单") || label.includes("头双")) return "orange";
  if (label.includes("头")) return "dark";
  if (label.includes("段")) return "soft";
  if (label.includes("合")) return "earth";
  return "purple";
};

function normalizeText(text) {
  return text
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\p{Script=Han}\d]+/gu, ",")
    .replace(/,+/g, ",")
    .replace(/^,|,$/g, "");
}

function parseNumberChunk(chunk) {
  if (!/^\d+$/.test(chunk)) return [];
  if (chunk.length > 2 && chunk.length % 2 === 0) {
    const pairs = chunk.match(/\d{2}/g) || [];
    const pairNums = pairs.map(Number);
    if (pairNums.every((n) => n >= 1 && n <= 49)) return pairNums.map(pad);
  }

  const num = Number(chunk);
  if (num >= 1 && num <= 49) return [pad(num)];
  return [];
}

function scanLabels(chunk, allLabels) {
  const found = [];
  let index = 0;

  while (index < chunk.length) {
    const match = allLabels.find((label) => chunk.startsWith(label, index));
    if (match) {
      found.push(canonical(match));
      index += match.length;
    } else {
      index += 1;
    }
  }

  return found;
}

function parseInput(text, ruleMap, allLabels) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  return normalized.split(",").flatMap((chunk) => {
    if (!chunk) return [];

    const numbers = parseNumberChunk(chunk);
    if (numbers.length) return numbers;

    const label = canonical(chunk);
    if (ruleMap[label]) return [label];

    return scanLabels(chunk, allLabels);
  });
}

function groupCounts(labels, styles) {
  const counts = styles.map((label) => labels.filter((item) => item === label).length);
  const uniqueCounts = unique(counts).sort((a, b) => b - a);
  return uniqueCounts.map((count) => ({
    count,
    labels: styles.filter((_, index) => counts[index] === count)
  }));
}

function formatGroupedNumbers(numberCounts) {
  const uniqueCounts = unique(Object.values(numberCounts)).sort((a, b) => b - a);
  return uniqueCounts.map((count) => ({
    count,
    labels: range(1, 49).filter((n) => numberCounts[n] === count).map(pad)
  }));
}

function App() {
  const selectedYear = ref(currentLunarYear());
  const selectedLabels = ref([]);
  const inputText = ref("");
  const view = ref("main");
  const toast = ref("");
  const canInstall = ref(false);
  const showInstall = ref(false);
  const isInstalled = ref(false);
  let installPrompt = null;

  const appTitle = computed(() => `${selectedYear.value}年挑码统计器`);
  const resultTitle = computed(() => `${selectedYear.value}年统计结果`);

  const zodiacNumbers = computed(() => buildZodiacNumbers(selectedYear.value));

  const elementNumbers = computed(() => buildElementNumbers(selectedYear.value));

  const ruleMap = computed(() => buildRuleMap(zodiacNumbers.value, elementNumbers.value));

  const allLabels = computed(() => Object.keys(ruleMap.value)
    .concat(Object.keys(aliasMap))
    .sort((a, b) => b.length - a.length));

  const labelCounts = computed(() => selectedLabels.value.reduce((map, label) => {
    map[label] = (map[label] || 0) + 1;
    return map;
  }, {}));

  const selectedChips = computed(() => Object.entries(labelCounts.value).map(([label, count]) => ({
    label,
    count,
    tone: chipTone(label)
  })));

  const numberCounts = computed(() => {
    const counts = Object.fromEntries(range(1, 49).map((n) => [n, 0]));
    selectedLabels.value.forEach((label) => {
      const nums = ruleMap.value[label] || [];
      nums.forEach((num) => {
        counts[num] += 1;
      });
    });
    return counts;
  });

  const numberGroups = computed(() => formatGroupedNumbers(numberCounts.value));
  const maxNumberCount = computed(() => Math.max(0, ...Object.values(numberCounts.value)));

  const shouldHighlightNumber = (num) => {
    const count = numberCounts.value[num] || 0;
    return count > 0 && count === maxNumberCount.value;
  };

  const numberTone = (num) => waveColorMap[num] || "";
  const numberClasses = (num) => ({
    active: shouldHighlightNumber(num),
    [numberTone(num)]: shouldHighlightNumber(num)
  });

  const categoryCard = (title, styles) => {
    const total = selectedLabels.value.filter((item) => styles.includes(item)).length;
    if (total === 0) return null;

    return {
      title: `${title}【共${total}次】`,
      lines: groupCounts(selectedLabels.value, styles)
        .filter((group) => group.count > 0)
        .map((group) => `【${pad(group.count)}次】：${group.labels.join(" ")}`)
    };
  };

  const resultCards = computed(() => [
    {
      title: "号码统计结果：",
      lines: numberGroups.value.map((group) => `【${pad(group.count)}次】：${group.labels.join(",")}(共${group.labels.length}个)`)
    },
    categoryCard("生肖统计结果", zodiacs),
    categoryCard("半单双统计结果", ["大双", "小双", "大单", "小单"]),
    categoryCard("波色统计结果", ["红波", "蓝波", "绿波"]),
    categoryCard("尾数统计结果", range(0, 9).map((n) => `${n}尾`)),
    categoryCard("头数统计结果", range(0, 4).map((n) => `${n}头`)),
    categoryCard("五行统计结果", ["金", "木", "水", "火", "土"])
  ].filter(Boolean));

  const showToast = (message, duration = 1500) => {
    toast.value = message;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.value = "";
    }, duration);
  };

  const addLabel = (label) => {
    selectedLabels.value.push(label);
    inputText.value = selectedLabels.value.join(" ");
  };

  const removeLabel = (label) => {
    const index = selectedLabels.value.indexOf(label);
    if (index >= 0) selectedLabels.value.splice(index, 1);
    inputText.value = selectedLabels.value.join(" ");
  };

  const updateFromText = () => {
    selectedLabels.value = parseInput(inputText.value, ruleMap.value, allLabels.value);
  };

  const clearAll = () => {
    selectedLabels.value = [];
    inputText.value = "";
  };

  const invertSelection = () => {
    const picked = new Set(selectedLabels.value);
    selectedLabels.value = allSelectableLabels.filter((label) => !picked.has(label));
    inputText.value = selectedLabels.value.join(" ");
  };

  const statistic = () => {
    updateFromText();
    view.value = "result";
  };

  const writeClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Fall back below when browser permission blocks clipboard writes.
      }
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
  };

  const copyText = async (card) => {
    await writeClipboard(`${card.title}\n${card.lines.join("\n")}`);
    showToast("复制成功");
  };

  const copyAll = async () => {
    const text = resultCards.value.map((card) => `${card.title}\n${card.lines.join("\n")}`).join("\n\n");
    await writeClipboard(text);
    showToast("复制成功");
  };

  const installApp = async () => {
    if (!installPrompt) {
      showToast("请点浏览器菜单，选择添加到主屏幕", 3600);
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    canInstall.value = false;
  };

  const resizeInstalledWindow = () => {
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (!standalone || window.innerWidth >= 1020 || window.screen.width < 900) return;

    const width = Math.min(1180, window.screen.availWidth || 1180);
    const height = Math.min(860, window.screen.availHeight || 860);
    const left = Math.max(0, Math.round(((window.screen.availWidth || width) - width) / 2));
    const top = Math.max(0, Math.round(((window.screen.availHeight || height) - height) / 2));

    try {
      window.resizeTo(width, height);
      window.moveTo(left, top);
    } catch {
      // Some browsers block window sizing; the app still remains responsive.
    }
  };

  watch(selectedYear, (year) => {
    document.title = `${year}年挑码统计器`;
  }, { immediate: true });

  onMounted(() => {
    isInstalled.value = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
    showInstall.value = !isInstalled.value && /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent);
    resizeInstalledWindow();

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      canInstall.value = true;
      showInstall.value = true;
    });

    window.addEventListener("appinstalled", () => {
      installPrompt = null;
      canInstall.value = false;
      showInstall.value = false;
      isInstalled.value = true;
      showToast("安装成功");
    });
  });

  return {
    addLabel,
    canInstall,
    chipTone,
    clearAll,
    copyAll,
    copyText,
    appTitle,
    inputText,
    installApp,
    invertSelection,
    isInstalled,
    labelCounts,
    maxNumberCount,
    numberClasses,
    numberTone,
    numberCounts,
    pad,
    removeLabel,
    resultCards,
    resultTitle,
    selectedChips,
    selectedYear,
    showInstall,
    statistic,
    tokenGroups,
    toast,
    updateFromText,
    view,
    zodiacNumbers,
    zodiacs
  };
}

createApp({
  setup: App,
  template: `
    <div class="page" :class="{ 'show-result': view === 'result' }">
      <header class="site-header">
        <div class="brand">
          <h1>{{ appTitle }}</h1>
          <p>农历年份</p>
        </div>
        <div class="header-actions">
          <button v-if="showInstall && !isInstalled" class="install-btn" type="button" @click="installApp">安装</button>
          <button class="top-result" type="button" @click="view = 'result'">查看结果</button>
        </div>
      </header>

      <main class="layout">
        <section class="zodiac-board" :class="{ hiddenMobile: view === 'result' }">
          <div class="zodiac-names">
            <span v-for="name in zodiacs" :key="name">{{ name }}</span>
          </div>
          <div class="zodiac-grid">
            <template v-for="row in 4" :key="row">
              <span
                v-for="name in zodiacs"
                :key="name + row"
                class="num"
                :class="numberClasses(zodiacNumbers[name][row - 1])"
              >
                <b>{{ pad(zodiacNumbers[name][row - 1]) }}</b>
                <small v-if="numberCounts[zodiacNumbers[name][row - 1]]">{{ numberCounts[zodiacNumbers[name][row - 1]] }}次</small>
              </span>
            </template>
          </div>
          <div class="last-num-row">
            <span v-for="name in zodiacs" :key="name + '-last'" class="last-num-cell">
              <span
                v-if="zodiacNumbers[name][4]"
                class="num"
                :class="numberClasses(zodiacNumbers[name][4])"
              >
                <b>{{ pad(zodiacNumbers[name][4]) }}</b>
                <small v-if="numberCounts[zodiacNumbers[name][4]]">{{ numberCounts[zodiacNumbers[name][4]] }}次</small>
              </span>
            </span>
          </div>
        </section>

        <section class="input-card" :class="{ hiddenMobile: view === 'result' }">
          <div class="tag-editor">
            <button
              v-for="chip in selectedChips"
              :key="chip.label"
              type="button"
              class="selected-tag"
              :class="chip.tone"
              @click="removeLabel(chip.label)"
            >
              {{ chip.label }}<span v-if="chip.count > 1">({{ chip.count }})</span> ×
            </button>
            <textarea
              v-model="inputText"
              placeholder="您可以通过文字输入需要统计的内容（例如：01,02,单数,家禽）&#10;支持各种标点、空格、换行、连续中文，例如：金木水火土"
            ></textarea>
          </div>
          <button class="update-btn" type="button" @click="updateFromText">更新</button>
        </section>

        <section class="chips" :class="{ hiddenMobile: view === 'result' }">
          <template v-for="row in tokenGroups" :key="row.join('-')">
            <button
              v-for="label in row"
              :key="label"
              type="button"
              class="chip"
              :class="[chipTone(label), { picked: labelCounts[label] }]"
              @click="addLabel(label)"
            >
              {{ label }}<small v-if="labelCounts[label]">({{ labelCounts[label] }})</small>
            </button>
          </template>
        </section>

        <div class="web-actions" :class="{ hiddenMobile: view === 'result' }">
          <button type="button" @click="clearAll">清空</button>
          <button type="button" @click="invertSelection">反选</button>
          <button type="button" class="primary" @click="statistic">统计</button>
        </div>

        <aside class="desktop-results">
          <ResultCards :cards="resultCards" @copy="copyText" />
        </aside>

        <section class="result-page" v-if="view === 'result'">
          <header class="result-header">
            <button type="button" @click="view = 'main'">返回</button>
            <div>
              <h2>{{ resultTitle }}</h2>
              <p>农历年份</p>
            </div>
            <button type="button" class="danger" @click="copyAll">复制全部</button>
          </header>
          <div class="result-note"><span>结果输出</span>按统计类型分卡片展示，保留一键复制文本格式</div>
          <ResultCards :cards="resultCards" @copy="copyText" />
        </section>
      </main>
      <div class="toast" v-if="toast">{{ toast }}</div>
    </div>
  `,
  components: {
    ResultCards: {
      props: ["cards"],
      emits: ["copy"],
      template: `
        <section class="result-list">
          <article class="result-card" v-for="card in cards" :key="card.title">
            <button type="button" class="copy-btn" @click="$emit('copy', card)">复制</button>
            <h3>{{ card.title }}</h3>
            <pre>{{ card.lines.join('\\n') }}</pre>
          </article>
        </section>
      `
    }
  }
}).mount("#app");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}

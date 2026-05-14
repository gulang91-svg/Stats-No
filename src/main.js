import { computed, createApp, ref } from "vue/dist/vue.esm-bundler.js";
import "./styles.css";

const pad = (num) => String(num).padStart(2, "0");
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const digitSum = (num) => String(num).split("").reduce((sum, n) => sum + Number(n), 0);
const unique = (items) => Array.from(new Set(items));

const zodiacs = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

const zodiacNumbers = {
  "鼠": [7, 19, 31, 43],
  "牛": [6, 18, 30, 42],
  "虎": [5, 17, 29, 41],
  "兔": [4, 16, 28, 40],
  "龙": [3, 15, 27, 39],
  "蛇": [2, 14, 26, 38],
  "马": [1, 13, 25, 37, 49],
  "羊": [12, 24, 36, 48],
  "猴": [11, 23, 35, 47],
  "鸡": [10, 22, 34, 46],
  "狗": [9, 21, 33, 45],
  "猪": [8, 20, 32, 44]
};

const redWave = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46];
const greenWave = [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49];
const blueWave = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48];

const elementNumbers = {
  "金": [4, 5, 12, 13, 26, 27, 34, 35, 42, 43],
  "木": [8, 9, 16, 17, 24, 25, 38, 39, 46, 47],
  "水": [1, 14, 15, 22, 23, 30, 31, 44, 45],
  "火": [2, 3, 10, 11, 18, 19, 32, 33, 40, 41, 48, 49],
  "土": [6, 7, 20, 21, 28, 29, 36, 37]
};

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
for (let i = 1; i <= 13; i += 1) ruleMap[`${i}合`] = range(1, 49).filter((n) => digitSum(n) === i);

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
  "兰": "蓝波"
};

const canonical = (label) => aliasMap[label] || label;

const allLabels = Object.keys(ruleMap)
  .concat(Object.keys(aliasMap))
  .sort((a, b) => b.length - a.length);

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

function scanLabels(chunk) {
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

function parseInput(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized.split(",").flatMap((chunk) => {
    if (!chunk) return [];
    const numbers = parseNumberChunk(chunk);
    if (numbers.length) return numbers;
    const label = canonical(chunk);
    if (ruleMap[label]) return [label];
    return scanLabels(chunk);
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
  const selectedLabels = ref(["马", "羊", "牛", "牛", "3尾"]);
  const inputText = ref("马 羊 牛 牛 3尾");
  const view = ref("main");
  const toast = ref("");

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
      const nums = ruleMap[label] || [];
      nums.forEach((num) => {
        counts[num] += 1;
      });
    });
    return counts;
  });

  const numberGroups = computed(() => formatGroupedNumbers(numberCounts.value));

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
    selectedLabels.value = parseInput(inputText.value);
  };

  const clearAll = () => {
    selectedLabels.value = [];
    inputText.value = "";
  };

  const statistic = () => {
    updateFromText();
    view.value = "result";
  };

  const showToast = (message) => {
    toast.value = message;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.value = "";
    }, 1500);
  };

  const copyText = async (card) => {
    const text = `${card.title}\n${card.lines.join("\n")}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      showToast("复制成功");
    }
  };

  const copyAll = async () => {
    const text = resultCards.value.map((card) => `${card.title}\n${card.lines.join("\n")}`).join("\n\n");
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      showToast("复制成功");
    }
  };

  return {
    addLabel,
    chipTone,
    clearAll,
    copyAll,
    copyText,
    inputText,
    labelCounts,
    numberCounts,
    pad,
    removeLabel,
    resultCards,
    selectedChips,
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
        <div>
          <h1>挑码统计器</h1>
          <p>2026年</p>
        </div>
        <button class="top-result" type="button" @click="view = 'result'">查看结果</button>
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
                :class="{ active: numberCounts[zodiacNumbers[name][row - 1]] }"
              >
                <b>{{ pad(zodiacNumbers[name][row - 1]) }}</b>
                <small v-if="numberCounts[zodiacNumbers[name][row - 1]]">{{ numberCounts[zodiacNumbers[name][row - 1]] }}次</small>
              </span>
            </template>
          </div>
          <div class="last-num-row">
            <span class="num" :class="{ active: numberCounts[49] }">
              <b>49</b>
              <small v-if="numberCounts[49]">{{ numberCounts[49] }}次</small>
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
          <button type="button">反选</button>
          <button type="button" class="primary" @click="statistic">统计</button>
        </div>

        <aside class="desktop-results">
          <ResultCards :cards="resultCards" @copy="copyText" />
        </aside>

        <section class="result-page" v-if="view === 'result'">
          <header class="result-header">
            <button type="button" @click="view = 'main'">返回</button>
            <div>
              <h2>统计结果</h2>
              <p>2026年</p>
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

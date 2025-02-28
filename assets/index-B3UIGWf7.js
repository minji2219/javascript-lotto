var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _numbers;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const LOTTO = {
  MIN_PRICE: 1e3,
  MAX_PRICE: 1e5,
  PRICE_STEP: 1e3,
  MAX_LOTTO_NUMBER: 45,
  MIN_LOTTO_NUMBER: 1,
  LOTTO_NUMBER_COUNT: 6
};
const PRIZE = {
  FIRST: {
    RANK: 1,
    WINNING_CRITERIA: 6,
    REWARD: 2e9
  },
  SECOND: {
    RANK: 2,
    WINNING_CRITERIA: 5,
    BONUS_MATCHED: true,
    REWARD: 3e7
  },
  THIRD: {
    RANK: 3,
    WINNING_CRITERIA: 5,
    REWARD: 15e5
  },
  FOURTH: {
    RANK: 4,
    WINNING_CRITERIA: 4,
    REWARD: 5e4
  },
  FIFTH: {
    RANK: 5,
    WINNING_CRITERIA: 3,
    REWARD: 5e3
  }
};
const RANK_MAP = {
  6: PRIZE.FIRST,
  5: (isBonusMatched) => isBonusMatched ? PRIZE.SECOND : PRIZE.THIRD,
  4: PRIZE.FOURTH,
  3: PRIZE.FIFTH
};
const generateRandomNumbers = (min, max, count) => {
  const numbers = /* @__PURE__ */ new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return [...numbers].sort((a, b) => a - b);
};
class Lotto {
  constructor(numbers) {
    __privateAdd(this, _numbers);
    __publicField(this, "getMatchCount", (winningNumbers) => {
      return __privateGet(this, _numbers).filter((number) => winningNumbers.includes(number)).length;
    });
    __publicField(this, "getBonusMatched", (bonusNumber) => {
      return __privateGet(this, _numbers).includes(bonusNumber);
    });
    __publicField(this, "getMatchResult", (winningNumbers, bonusNumber) => {
      return {
        matchCount: this.getMatchCount(winningNumbers),
        isBonusMatched: this.getBonusMatched(bonusNumber)
      };
    });
    __privateSet(this, _numbers, numbers);
  }
  get numbers() {
    return __privateGet(this, _numbers);
  }
}
_numbers = new WeakMap();
class LottoGame {
  generateLottos(price) {
    const count = price / LOTTO.PRICE_STEP;
    return Array.from(
      { length: count },
      () => new Lotto(
        generateRandomNumbers(
          LOTTO.MIN_LOTTO_NUMBER,
          LOTTO.MAX_LOTTO_NUMBER,
          LOTTO.LOTTO_NUMBER_COUNT
        )
      )
    );
  }
  playLotto(lottos, result) {
    const { winningNumbers, bonusNumber } = result;
    return lottos.map((lotto) => {
      const { matchCount, isBonusMatched } = lotto.getMatchResult(
        winningNumbers,
        bonusNumber
      );
      return this.checkRank(matchCount, isBonusMatched);
    }).filter(Boolean);
  }
  checkRank(matchCount, isBonusMatched) {
    const rank = RANK_MAP[matchCount];
    return typeof rank === "function" ? rank(isBonusMatched) : rank;
  }
  calcTotalReward(gameResults) {
    return gameResults.reduce(
      (totalReward, result) => totalReward + result.REWARD,
      0
    );
  }
  getRankCount(gameResults) {
    const rankCount = gameResults.reduce(
      (resultCount, result) => resultCount.map(
        (count, index) => index === result.RANK ? count + 1 : count
      ),
      new Array(6).fill(0)
    );
    return Object.fromEntries(
      Object.entries(PRIZE).map(([key], index) => [
        key,
        rankCount[index + 1] || 0
      ])
    );
  }
}
const calcProfitRate = (price, reward) => {
  return reward / price * 100;
};
const formatResults = (resultCount) => {
  return Object.entries(PRIZE).map(([key, { WINNING_CRITERIA, REWARD }]) => ({
    rank: key,
    // "FIFTH", "FOURTH"...
    winningCriteria: WINNING_CRITERIA,
    // 당첨 조건으로 필요한 숫자 개수
    reward: REWARD,
    // 당첨 금액
    count: resultCount[key] || 0
    // 당첨된 개수 (없으면 0)
  }));
};
const retryUntilValid = (input, validateFunc) => {
  try {
    const validatedInput = validateFunc(input);
    return validatedInput;
  } catch (err) {
    alert(err.message);
  }
};
const ERROR_MESSAGE = {
  INVALID_NUMBER: "숫자를 입력해주세요.",
  INVALID_PRICE_UNIT: "1000원 단위로 입력해주세요.",
  INVALID_PRICE_RANGE: "1000원 이상 10만원 이하로 입력해주세요.",
  INVALID_LOTTO_NUMBER_RANGE: "1부터 45 사이의 숫자를 입력해주세요.",
  INVALID_LOTTO_NUMBER_LENGTH: "6개의 숫자를 입력해주세요.",
  INVALID_LOTTO_DUPLICATE_NUMBER: "중복된 숫자가 있습니다.",
  INVALID_BONUS_NUMBER: "당첨 번호와 중복되지 않는 숫자를 입력해주세요."
};
const isNumber = (input) => {
  const regex = /^[0-9]*$/;
  return regex.test(input);
};
const isValidPriceUnit = (input) => {
  return input % LOTTO.PRICE_STEP == 0;
};
const isValidPriceRange = (input) => {
  return input >= LOTTO.MIN_PRICE && input <= LOTTO.MAX_PRICE;
};
const validatePrice = (input) => {
  if (!isNumber(input)) throw new Error(ERROR_MESSAGE.INVALID_NUMBER);
  const price = Number(input);
  if (!isValidPriceUnit(price))
    throw new Error(ERROR_MESSAGE.INVALID_PRICE_UNIT);
  if (!isValidPriceRange(price))
    throw new Error(ERROR_MESSAGE.INVALID_PRICE_RANGE);
  return price;
};
const validateRange = (number) => {
  if (isNaN(number) || number < LOTTO.MIN_LOTTO_NUMBER || number > LOTTO.MAX_LOTTO_NUMBER) {
    throw new Error(ERROR_MESSAGE.INVALID_LOTTO_NUMBER_RANGE);
  }
};
const validateLength = (numbers) => {
  if (numbers.length !== LOTTO.LOTTO_NUMBER_COUNT) {
    throw new Error(ERROR_MESSAGE.INVALID_LOTTO_NUMBER_LENGTH);
  }
};
const validateDuplicate = (numbers) => {
  if (new Set(numbers).size !== LOTTO.LOTTO_NUMBER_COUNT) {
    throw new Error(ERROR_MESSAGE.INVALID_LOTTO_DUPLICATE_NUMBER);
  }
};
const validateWinningNumbers = (input) => {
  const numbers = input.split(",").map(Number);
  numbers.forEach((number) => validateRange(number));
  validateLength(numbers);
  validateDuplicate(numbers);
  return numbers;
};
const validateBonusNumber = (bonusNumber, winningNumbers) => {
  validateRange(bonusNumber);
  if (winningNumbers.includes(Number(bonusNumber))) {
    throw new Error(ERROR_MESSAGE.INVALID_BONUS_NUMBER);
  }
  return Number(bonusNumber);
};
const getLottoPrice = () => {
  return retryUntilValid(
    document.querySelector(".purchase input").value,
    validatePrice
  );
};
const getWinningNumbers = () => {
  const winningNumbersEl = document.querySelectorAll(".winning-number");
  const winningNumbers = [...winningNumbersEl].map((winningNumber) => {
    return winningNumber.value;
  });
  return retryUntilValid(winningNumbers.join(","), validateWinningNumbers);
};
const getBonusNumber = (winningNumbers) => {
  const bonusNumber = document.querySelector(".bonus-number").value;
  return retryUntilValid(
    bonusNumber,
    (bonusNumber2) => validateBonusNumber(bonusNumber2, winningNumbers)
  );
};
const commaizeNumber = (number) => Number(number).toLocaleString("ko-KR");
const printLottoCount = (count) => {
  const purchaseHistoryEl = document.querySelector(".purchase-history");
  const countEl = document.createElement("p");
  countEl.textContent = `총 ${count}개를 구매했습니다.`;
  countEl.classList.add("count");
  purchaseHistoryEl.prepend(countEl);
};
const printLottoNumbers = (numbers) => {
  const lottoListEl = document.querySelector(".lotto-list");
  const numbersEl = document.createElement("li");
  numbersEl.classList.add("lotto-numbers");
  lottoListEl.appendChild(numbersEl);
  const ticketImg = document.createElement("span");
  ticketImg.classList.add("lotto-ticket__img");
  ticketImg.innerText = "🎟️";
  numbersEl.appendChild(ticketImg);
  numbersEl.append(`${numbers}`);
};
const printResult = (results) => {
  const resultTableEl = document.querySelector(".modal .description");
  results.map(({ rank, winningCriteria, reward, count }) => {
    const bonusText = rank === "SECOND" ? "+보너스볼" : "";
    const tr = document.createElement("tr");
    tr.classList.add("result__row");
    tr.innerHTML = `
      <td>${winningCriteria}개${bonusText}</td>
      <td>${commaizeNumber(reward)}</td>
      <td>${count}개</td>`;
    resultTableEl.appendChild(tr);
  });
};
const printProfitRate = (profit) => {
  const resultTableEl = document.querySelector(".modal .description");
  const profitRateEl = document.createElement("p");
  profitRateEl.classList.add("profit");
  profitRateEl.innerText = `당신의 총 수익률은 ${commaizeNumber(
    profit
  )}%입니다.`;
  resultTableEl.after(profitRateEl);
};
class lottoControllerUI {
  constructor() {
    __publicField(this, "lottos");
    __publicField(this, "handlePurchaseClick", (e) => {
      const price = getLottoPrice();
      if (price) {
        e.target.disabled = true;
        this.lottos = this.lottoGame.generateLottos(price);
        printLottoCount(this.lottos.length);
        const lottoListEl = document.createElement("ul");
        lottoListEl.classList.add("lotto-list");
        document.querySelector(".purchase-history .count").after(lottoListEl);
        this.lottos.forEach((lotto) => printLottoNumbers(lotto.numbers));
        document.querySelector(".winning-lotto").classList.add("active");
        document.querySelector(".winning-number").focus();
      }
    });
    __publicField(this, "handleInputChange", (inputs) => {
      const allFilled = Array.from(inputs).every(
        (input) => input.value.trim() !== ""
      );
      document.querySelector(".winning-lotto .result").disabled = !allFilled;
    });
    __publicField(this, "handleResultClick", (inputs) => {
      if (document.querySelector(".result__row")) {
        document.querySelector(".overlay").classList.add("active");
        return;
      }
      const winningNumbers = getWinningNumbers();
      if (!winningNumbers) return;
      const bonusNumber = getBonusNumber(winningNumbers);
      if (!bonusNumber) return;
      document.querySelector(".overlay").classList.add("active");
      const gameResults = this.lottoGame.playLotto(this.lottos, {
        winningNumbers,
        bonusNumber
      });
      const totalReward = this.lottoGame.calcTotalReward(gameResults);
      const rankCount = this.lottoGame.getRankCount(gameResults);
      console.log(rankCount);
      printResult(formatResults(rankCount).reverse());
      printProfitRate(calcProfitRate(getLottoPrice(), totalReward));
      inputs.forEach((input) => {
        input.disabled = true;
      });
    });
    __publicField(this, "handleRetryClick", (inputs) => {
      document.querySelector(".overlay").classList.remove("active");
      document.querySelector(".winning-lotto").classList.remove("active");
      document.querySelector(".purchase-history").replaceChildren();
      [...document.querySelectorAll(".result__row")].map((resultRow) => {
        resultRow.remove();
      });
      document.querySelector(".profit").remove();
      document.querySelector(".purchase input").value = "";
      [...document.querySelectorAll(".winning-number")].map(
        (winningNumberInput) => {
          winningNumberInput.value = "";
        }
      );
      document.querySelector(".bonus-number").value = "";
      document.querySelector(".purchase button").disabled = false;
      inputs.forEach((input) => {
        input.disabled = false;
      });
    });
    __publicField(this, "stopPropagation", (e) => {
      e.stopPropagation();
    });
    __publicField(this, "handleCloseClick", (e) => {
      document.querySelector(".overlay").classList.remove("active");
    });
    this.lottoGame = new LottoGame();
  }
}
const init = async () => {
  const lottoController = new lottoControllerUI();
  document.querySelector(".purchase").addEventListener("submit", (e) => {
    e.preventDefault();
  });
  document.querySelector(".purchase button").addEventListener("click", lottoController.handlePurchaseClick);
  const inputs = document.querySelectorAll(".inputs__winning-number input");
  inputs.forEach((input) => {
    input.addEventListener(
      "input",
      () => lottoController.handleInputChange(inputs)
    );
  });
  document.querySelector(".winning-lotto .result").addEventListener("click", () => lottoController.handleResultClick(inputs));
  document.querySelector(".modal .retry").addEventListener("click", () => lottoController.handleRetryClick(inputs));
  document.querySelector(".modal .close").addEventListener("click", lottoController.handleCloseClick);
  document.querySelector(".modal").addEventListener("click", lottoController.stopPropagation);
  document.querySelector(".overlay").addEventListener("click", lottoController.handleCloseClick);
};
init();

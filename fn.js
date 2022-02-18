let isLoading = false;

/**
 * @param {string} expr
 * @returns {Promise<number>}
 */
const mathAPI = async (expr) => {
  const encoded = encodeURIComponent(expr);
  const url = `https://api.mathjs.org/v4/?expr=${encoded}`;

  const res = await fetch(url);

  if (res.status === 400) {
    throw new Error("math error: invalid equations format");
  }
  return res.json();
};

/**
 * @param {string} expr
 * @returns {string}
 */
const mathMap = (expr) => {
  const isModExpr = expr.match(/(\d+mod\d+)/g);

  if (isModExpr) {
    const nums = expr.split("mod");
    const [x, y] = nums;
    return expr.replace(/(\d+mod\d+)/g, `(${x}-${y}*floor(${x}/${y}))`);
  }

  return expr;
};

/**
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {string} exprStr
 * @returns {Promise<number[]>}
 */
const mathCalc = async (a, b, c, exprStr) => {
  const exprTrim = exprStr.replace(/\s+/g, "");
  const exprValA = exprTrim.replace(/A/gi, a);
  const exprValB = exprValA.replace(/B/gi, b);
  const exprValC = exprValB.replace(/C/gi, c);
  const exprValX = exprValC.replace(/X/gi, "*");

  const exprSplit = exprValX.split("=?");
  const exprArr = exprSplit.filter((x) => x);

  if (exprArr.length === 4) {
    const answers = [];

    for (const exprVal of exprArr) {
      const question = mathMap(exprVal);
      const answer = await mathAPI(question);

      answers.push(answer);
    }

    console.log(exprStr);
    console.log(exprArr);
    console.log(answers);

    return answers;
  }

  throw new Error("math error: invalid equations format");
};

const reset = () => {
  document.getElementById("a-val").value = 1;
  document.getElementById("b-val").value = 1;
  document.getElementById("c-val").value = 4;
  document.getElementById("eqns-val").value = "(A + (B + 1) / 2 x C) + 2mod10 = ?\n\n(A - B x C) + 7 = ?\n\n(A x B x C) x 1000 = ?\n\n(A x B - C) = ?";
  document.getElementById("loader").style.display = "none";
  document.getElementById("answers").style.display = "none";
  document.getElementById("answers").innerHTML = `[]`;
  isLoading = false;
};

const calculate = async () => {
  if (isLoading) {
    alert("Please wait, still solving ⌛ ..");
    return;
  }

  try {
    const aval = parseFloat(document.getElementById("a-val").value);
    if (!aval) throw new Error("missing input: A value");

    const bval = parseFloat(document.getElementById("b-val").value);
    if (!bval) throw new Error("missing input: B value");

    const cval = parseFloat(document.getElementById("c-val").value);
    if (!cval) throw new Error("missing input: C value");

    const eqns = document.getElementById("eqns-val").value;
    if (!eqns) throw new Error("missing input: equations");

    document.getElementById("answers").style.display = "none";
    isLoading = true;

    document.getElementById("loader").style.display = "block";

    const answers = await mathCalc(aval, bval, cval, eqns);
    document.getElementById("loader").style.display = "none";
    document.getElementById("answers").innerHTML = `[${answers.join(", ")}]`;
    document.getElementById("answers").style.display = "block";

    isLoading = false;
  } catch (err) {
    alert(err.message);
    document.getElementById("loader").style.display = "none";
    isLoading = false;
  }
};

reset();

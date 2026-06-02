// Tiny safe expression evaluator.
// Supports: numbers, identifiers, + - * / unary-minus, < > <= >= == !=, parentheses.
// Returns whatever the top-level expression evaluates to (number or boolean).

const TOKEN_NUMBER = "NUM";
const TOKEN_IDENT = "ID";
const TOKEN_OP = "OP";
const TOKEN_LPAREN = "(";
const TOKEN_RPAREN = ")";
const TOKEN_EOF = "EOF";

const TWO_CHAR_OPS = new Set(["<=", ">=", "==", "!="]);
const ONE_CHAR_OPS = new Set(["<", ">", "+", "-", "*", "/"]);

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === " " || ch === "\t" || ch === "\n") {
      i++;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: TOKEN_LPAREN });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: TOKEN_RPAREN });
      i++;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (TWO_CHAR_OPS.has(two)) {
      tokens.push({ type: TOKEN_OP, value: two });
      i += 2;
      continue;
    }
    if (ONE_CHAR_OPS.has(ch)) {
      tokens.push({ type: TOKEN_OP, value: ch });
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      const num = Number(src.slice(i, j));
      if (!Number.isFinite(num)) throw new Error(`Invalid number: ${src.slice(i, j)}`);
      tokens.push({ type: TOKEN_NUMBER, value: num });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < src.length && /[a-zA-Z_0-9]/.test(src[j])) j++;
      tokens.push({ type: TOKEN_IDENT, value: src.slice(i, j) });
      i = j;
      continue;
    }
    throw new Error(`Unexpected character: ${ch}`);
  }
  tokens.push({ type: TOKEN_EOF });
  return tokens;
}

function parse(tokens, resolveVar) {
  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];
  const expect = (pred, msg) => {
    const t = peek();
    if (!pred(t)) throw new Error(msg);
    return consume();
  };

  function parseExpr() {
    return parseComparison();
  }

  function parseComparison() {
    let left = parseAdditive();
    const t = peek();
    if (t.type === TOKEN_OP && ["<", ">", "<=", ">=", "==", "!="].includes(t.value)) {
      consume();
      const right = parseAdditive();
      switch (t.value) {
        case "<": return left < right;
        case ">": return left > right;
        case "<=": return left <= right;
        case ">=": return left >= right;
        case "==": return left === right;
        case "!=": return left !== right;
      }
    }
    return left;
  }

  function parseAdditive() {
    let left = parseMultiplicative();
    while (peek().type === TOKEN_OP && (peek().value === "+" || peek().value === "-")) {
      const op = consume().value;
      const right = parseMultiplicative();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseMultiplicative() {
    let left = parseUnary();
    while (peek().type === TOKEN_OP && (peek().value === "*" || peek().value === "/")) {
      const op = consume().value;
      const right = parseUnary();
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  function parseUnary() {
    if (peek().type === TOKEN_OP && peek().value === "-") {
      consume();
      return -parseUnary();
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const t = peek();
    if (t.type === TOKEN_NUMBER) {
      consume();
      return t.value;
    }
    if (t.type === TOKEN_IDENT) {
      consume();
      const v = resolveVar(t.value);
      if (v == null || !Number.isFinite(v)) {
        throw new Error(`Unknown or missing variable: ${t.value}`);
      }
      return v;
    }
    if (t.type === TOKEN_LPAREN) {
      consume();
      const v = parseExpr();
      expect((x) => x.type === TOKEN_RPAREN, "Expected )");
      return v;
    }
    throw new Error(`Unexpected token at position ${pos}`);
  }

  const result = parseExpr();
  if (peek().type !== TOKEN_EOF) throw new Error("Unexpected trailing input");
  return result;
}

export function evalExpr(src, resolveVar) {
  const tokens = tokenize(src);
  return parse(tokens, resolveVar);
}

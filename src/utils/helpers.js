/**
 * オブジェクトから値に対応するキーを取得
 * @param {Object} obj - 検索対象のオブジェクト
 * @param {*} value - 検索する値
 * @returns {string|undefined} - 見つかったキー
 */
export const getKeyByValue = (obj, value) => {
  const item=Object.keys(obj).find((key) => obj[key] === value);
  return item.split(".")[1]
};

/**
 * オブジェクトの配列をCSV形式の文字列に変換
 * @param {Array<Object>} data - 変換するデータ配列
 * @param {Array<string>} headers - CSVヘッダー
 * @returns {string} - CSV形式の文字列
 */
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';

  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] ?? '';
      return `"${value}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * カンマ区切りの文字列を配列に変換（空白を除去）
 * @param {string} str - カンマ区切りの文字列
 * @returns {Array<string>} - 配列
 */
export const parseCommaSeparated = (str) => {
  if (!str || str.trim() === '') return [];
  return str.split(',').map(item => item.trim()).filter(item => item !== '');
};

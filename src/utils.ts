export const formatMoney = (summy: number) => {
  const sum = summy.toString();
  if (sum.length > 6) {
    const cutPoint1 = sum.length - 6;
    const cutPoint2 = sum.length - 3;
    return `${sum.substring(0, cutPoint1)} ${sum.substring(cutPoint1, cutPoint2)} ${sum.substring(cutPoint2)} kr`;
  } else if (sum.length > 3) {
    const cutPoint = sum.length - 3;
    return `${sum.substring(0, cutPoint)} ${sum.substring(cutPoint)} kr`;
  } else {
    return sum + ' kr';
  }
};

// format date to norwegian format
export function formatDate(date: Date) {
  const day = '0' + date.getDate();
  const month = '0' + (date.getMonth() + 1);
  const year = date.getFullYear();
  return `${day.substr(-2)}.${month.substr(-2)}.${year}`;
}

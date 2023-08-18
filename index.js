import fs from 'fs';

const data = [['xxxx.xxxxxx.xxxxx.0', 'successd', 1692360612000, 1692360613000]];

for (let i = 1; i < 20000; i++) {
  const last = data[i -1];
  data.push([`xxxx.xxxxxx.xxxxx.${i}`, 'successd', last[2] + 1000, last[3] + 1000])
}

fs.writeFile('./src/data.json', JSON.stringify(data), () => {})
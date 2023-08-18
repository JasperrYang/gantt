import React, { useMemo } from 'react';
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import moment from 'moment';
import sourceData from './data.json';

const HEIGHT = 10;
const MINCOUNT = 14;
const SUCCESS = 'succeed';

const removeTimeZero = (time: string) => {
  const timeArr = time.split('.');
  return Number(timeArr?.[1]) === 0 ? timeArr?.[0] : time;
};

const formatTimeStamp = timeStamp => removeTimeZero(moment(timeStamp).format('YYYY-MM-DD HH:mm:ss.SSS'));

const formatData = () => {
  return sourceData
          .sort((cur, next) => Number(next[2]) - Number(cur[2]))
          .map((item, index) => [index].concat(item as []));
};

const renderGanttItem = (params, api) => {
  const categoryIndex = api.value(0);
  const startTime = api.coord([api.value(3), categoryIndex]);
  const endTime = api.coord([api.value(4), categoryIndex]);
  const width = endTime[0] - startTime[0];

  const rectShape = echarts.graphic.clipRectByRect({
    x: startTime[0],
    y: startTime[1] - HEIGHT,
    width: width < 5 && width > 0 ? 5 : width,
    height: HEIGHT,
  }, {
    x: params.coordSys.x,
    y: params.coordSys.y,
    width: params.coordSys.width,
    height: params.coordSys.height,
  });

  return rectShape && {
    type: 'rect',
    shape: { ...rectShape, r: [10] },
    style: {
      fill: api.value(2) === SUCCESS ? '#00A870' : '#E34D59',
    },
  };
};

const renderAxisLabelItem = (params, api) => {
  const y = api.coord([0, api.value(0)])[1];

  return {
    type: 'group',
    position: [0, y],
    width: 220,
    children: [
      {
        type: 'text',
        style: {
          x: 20,
          y: 0,
          width: 200,
          overflow: 'truncate',
          textVerticalAlign: 'bottom',
          textAlign: 'left',
          text: api.value(1),
          textFill: '#0052D9',
        },
      },
    ],
  };
};

const Gantt: React.FC = () => {
  const data = formatData();

  const option = useMemo(() => ({
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        axis: 'y',
        label: {
          show: false,
        },
      },
      formatter: (params) => {
        if (!params?.[0]?.data?.[1]) {
          return '';
        }
        return [
          `<span style="font-size: 12px; font-weight: 500; color: #202D40">${params?.[0].data?.[1]}</span><br/>`,
          `<span style="display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;border-radius:4px;width:4px;height:4px;background-color:#5470c6;"></span><span style="font-size: 12px; font-weight: 400; color: #202D40; margin: 0">开始时间: ${formatTimeStamp(params?.[0].data[3])}</span><br />`,
          `<span style="display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;border-radius:4px;width:4px;height:4px;background-color:#5470c6;"></span><span style="font-size: 12px; font-weight: 400; color: #202D40">结束时间: ${formatTimeStamp(params?.[0].data[4])}</span><br />`,
          `<span style="display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;border-radius:4px;width:4px;height:4px;background-color:#5470c6;"></span><span style="font-size: 12px; font-weight: 400; color: #202D40">执行耗时: ${Number(params?.[0]?.data?.[4]) - Number(params?.[0]?.data?.[3])}</span>`,
        ].join('');
      },
    },
    animation: false,
    title: {},
    dataZoom: [
      {
        type: 'slider',
        show: true,
        start: 0,
        end: 100,
        height: 20,
        handleSize: 15,
        bottom: 10,
        labelFormatter: (v: unknown) => formatTimeStamp(v),
        handleIcon:
        'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      },
      {
        type: 'inside',
        id: 'insideX',
        xAxisIndex: 0,
        filterMode: 'weakFilter',
        start: 0,
        end: 100,
        bottom: 10,
        zoomOnMouseWheel: false,
        moveOnMouseMove: true,
      },
      {
        type: 'inside',
        id: 'insideY',
        zoomLock: true,
        yAxisIndex: 0,
        start: 100 - 100 / ((HEIGHT * data.length) / (HEIGHT * MINCOUNT)),
        end: 100,
        zoomOnMouseWheel: false,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
      },
    ],
    grid: {
      show: true,
      top: 30,
      left: 230,
      right: 10,
      bottom: 40,
      backgroundColor: '#fff',
      borderWidth: 0,
    },
    xAxis: {
      type: 'time',
      position: 'top',
      boundaryGap: ['1%', '1%'],
      splitLine: {
        show: true,
        lineStyle: {
          color: ['#F1F2F5'],
        },
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        lineStyle: {
          color: '#F1F2F5',
        },
      },
      axisLabel: {
        color: 'rgba(0, 10, 41, 0.4)',
        inside: false,
        align: 'center',
        formatter: (value: moment.MomentInput) => removeTimeZero(moment(value).format('HH:mm:ss.SSS')),
      },
    },
    yAxis: {
      axisTick: { show: false },
      splitLine: { show: false },
      axisLine: { show: false },
      axisLabel: { show: false },
      min: 0,
      max: data.length,
    },
    series: [
      {
        type: 'custom',
        renderItem: renderGanttItem,
        dimensions: ['Id', 'Name', 'Status', 'Start Time', 'End Time'],
        encode: {
          x: [3, 4],
          y: -1,
        },
        data,
      },
      {
        type: 'custom',
        renderItem: renderAxisLabelItem,
        dimensions: ['Id', 'Name', 'Status', 'Start Time', 'End Time'],
        encode: {
          x: -1,
          y: 0,
        },
        data,
      },
    ],
  }), [data]);

  return (
    <ReactECharts
      option={option}
      style={{ height: 500 }}
    />
  );
};

export default Gantt;

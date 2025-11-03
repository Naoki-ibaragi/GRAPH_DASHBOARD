import React from 'react'
import {Chart,Series,Title,XAxis,YAxis,Legend} from '@highcharts/react';
import { Line } from '@highcharts/react/series';


function GraphLine() {
  return (
    <Line>
        <Title>ライン</Title>
        <Series
        type="line"
        data={[[0,0],[1,1],[2,2],[3,3]]}
        />
    </Line>
  )
}

export default GraphLine
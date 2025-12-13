import React from 'react'
import { db_items } from '../Variables/ForManualData'
import { alarmCodes } from '../Variables/AlarmNumber'

function Manual() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダーセクション */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">マニュアルページ</h1>
          <p className="text-gray-600 text-lg mb-2">このページでは各機能の使い方を説明します</p>
          <p className="text-gray-500">メニューバーから各ページに戻ってください</p>
        </div>

        {/* 目次ナビゲーション */}
        <nav className="bg-white rounded-lg shadow-md p-6 mb-8 top-4 z-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">目次</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#lot-download"
              className="flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 font-medium"
            >
              <span className="mr-2">📊</span>ロットダウンロードについて
            </a>
            <a
              href="#alarm-download"
              className="flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 font-medium"
            >
              <span className="mr-2">🚨</span>アラームデータダウンロードについて
            </a>
            <a
              href="#graph-create"
              className="flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 font-medium"
            >
              <span className="mr-2">📈</span>グラフ作成について
            </a>
          </div>
        </nav>

        {/* ロットデータダウンロードセクション */}
        <section id="lot-download" className="bg-white rounded-lg shadow-lg p-8 mb-8 scroll-mt-20">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">📊</span>
            <h2 className="text-3xl font-bold text-gray-900">ロットデータダウンロード</h2>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-gray-700 leading-relaxed">
              エントリーにロット番号を打ち込むことで1ロット単位のデータをダウンロードできます。<br/>
              ダウンロードできるデータは下記のとおりです。
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    ヘッダー名
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    詳細
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.keys(db_items).map((item, index)=>(
                  <tr key={item} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{db_items[item]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* アラームデータダウンロードセクション */}
        <section id="alarm-download" className="bg-white rounded-lg shadow-lg p-8 mb-8 scroll-mt-20">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">🚨</span>
            <h2 className="text-3xl font-bold text-gray-900">アラームデータダウンロード</h2>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-gray-700 leading-relaxed">
              装置毎の搬送エラーアラームの発生回数をダウンロードできます。<br/>
              各アラーム番号の詳細は下記のとおりです。
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-red-600 to-red-700">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    アラーム番号
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    詳細
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.keys(alarmCodes).map((unit)=>(
                  Object.keys(alarmCodes[unit]).map((item, index)=>(
                    <tr key={`${unit}_${item}`} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{`${unit}_${item}`}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{alarmCodes[unit][item]}</td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* グラフ作成セクション */}
        <section id="graph-create" className="bg-white rounded-lg shadow-lg p-8 mb-8 scroll-mt-20">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">📈</span>
            <h2 className="text-3xl font-bold text-gray-900">グラフ作成</h2>
          </div>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-gray-700 leading-relaxed">
              4種類のグラフをプロット可能です<br/>
              1.散布図<br/>
              2.時系列プロット<br/>
              3.ヒストグラム<br/>
              4.密度プロット<br/>
              プロットの数が10万を超えると応答が悪くなります。フィルターやデータ取得期間を調整してください。
            </p>
          </div>
        </section>

        {/* ページトップに戻るボタン */}
        <div className="flex justify-center">
          <a
            href="#"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
          >
            <span className="mr-2">↑</span>ページトップに戻る
          </a>
        </div>
      </div>
    </div>
  )
}

export default Manual
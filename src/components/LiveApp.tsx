import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS, FONTS } from '../theme';

const Tabs = ['Live', 'History', 'Device'];

export const LiveApp = () => {
  const [tab, setTab] = useState(0);
  const [hr, setHr] = useState(72);
  const [spo, setSpo] = useState(98);
  const [temp, setTemp] = useState(36.6);

  useEffect(() => {
    const id = setInterval(() => {
      setHr((v) => Math.max(65, Math.min(85, v + (Math.random() > 0.5 ? 1 : -1))));
      setSpo((v) => Math.max(95, Math.min(100, v + (Math.random() > 0.7 ? 1 : 0))));
      setTemp((v) => +(v + (Math.random() - 0.5) * 0.1).toFixed(1));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={s.appbar}>
        <Text style={s.h2}>{Tabs[tab]}</Text>
        <View style={s.chip}><View style={s.dot} /><Text style={s.chipTxt}>Live</Text></View>
        <TouchableOpacity style={s.iconbtn}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={COLORS.appInk} strokeWidth={2} strokeLinecap="round">
            <Circle cx={12} cy={5} r={1.4} fill={COLORS.appInk} />
            <Circle cx={12} cy={12} r={1.4} fill={COLORS.appInk} />
            <Circle cx={12} cy={19} r={1.4} fill={COLORS.appInk} />
          </Svg>
        </TouchableOpacity>
      </View>

      {tab === 0 && <LiveTab hr={hr} spo={spo} temp={temp} />}
      {tab === 1 && <HistoryTab />}
      {tab === 2 && <DeviceTab />}

      <View style={s.navbar}>
        {Tabs.map((t, i) => (
          <TouchableOpacity key={t} style={s.navItem} onPress={() => setTab(i)}>
            <View style={[s.navPill, i === tab && s.navPillOn]}>
              <Text style={[s.navTxt, i === tab && s.navTxtOn]}>{t}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const LiveTab = ({ hr, spo, temp }: { hr: number; spo: number; temp: number }) => (
  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
    <View style={s.prof}>
      <View style={s.avatar}><Text style={s.avatarTxt}>AD</Text></View>
      <View><Text style={s.profB}>Alex Doe</Text><Text style={s.profS}>Inguardia IG-1 · Connected</Text></View>
    </View>

    <View style={s.stage3d}>
      <View style={s.floor} />
      <View style={s.devShape}>
        <Svg width={130} height={130} viewBox="0 0 64 64" fill="none" stroke={COLORS.seaDeep} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12 12c0 18 8 28 20 28s20-10 20-28" />
          <Path d="M20 12c0 12 5 20 12 20s12-8 12-20" />
          <Path d="M26 42v14a6 6 0 0 0 12 0V42" fill="#fff" />
          <Path d="M26 50h12" stroke={COLORS.aqua} strokeWidth={2.4} />
        </Svg>
      </View>
      <View style={s.ovTl}><View style={s.pill}><View style={s.ovDot} /><Text style={s.ovTxt}>Connected</Text></View></View>
      <View style={s.ovTr}><View style={s.pill}><Text style={s.ovTxt}>87%</Text></View></View>
      <View style={s.ovBl}><View style={s.pill}><Text style={s.ovTxt}>3D model</Text></View></View>
      <View style={s.ovBr}><Text style={s.ovTxt}>Drag to rotate</Text></View>
    </View>

    <View style={s.cards}>
      <View style={[s.card, s.wide]}>
        <View style={s.ch}>
          <View style={[s.ico, { backgroundColor: '#FDE7E8' }]}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill={COLORS.heart}>
              <Path d="M12 21s-8-4.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-8 11-8 11z" />
            </Svg>
          </View>
          <Text style={s.chTxt}>Heart rate</Text>
          <Text style={s.aside}>live</Text>
        </View>
        <View style={s.valRow}><Text style={s.valN}>{hr}</Text><Text style={s.valU}>bpm</Text></View>
        <View style={s.hrBars}>
          {Array.from({ length: 18 }).map((_, i) => <View key={i} style={[s.hrBar, { height: 12 + ((i * 7 + hr) % 30) }]} />)}
        </View>
      </View>

      <View style={s.card}>
        <View style={s.ch}><Text style={s.chTxt}>SpO₂</Text></View>
        <View style={s.valRow}><Text style={s.valN}>{spo}</Text><Text style={s.valU}>%</Text></View>
        <View style={s.qual}>{[0,1,2,3].map(i => <View key={i} style={[s.qBar, i >= 3 && { backgroundColor: COLORS.appLine }]} />)}</View>
      </View>

      <View style={s.card}>
        <View style={s.ch}><Text style={s.chTxt}>Temp</Text></View>
        <View style={s.valRow}><Text style={s.valN}>{temp.toFixed(1)}</Text><Text style={s.valU}>°C</Text></View>
        <Text style={s.sub}>Normal</Text>
      </View>

      <View style={s.card}>
        <View style={s.ch}><Text style={s.chTxt}>Bites</Text></View>
        <View style={s.valRow}><Text style={s.valN}>12</Text><Text style={s.valU}>today</Text></View>
        <View style={s.bites}>
          {[6,10,8,14,11,12].map((h, i) => <View key={i} style={[s.bite, { height: h, backgroundColor: i === 5 ? COLORS.sea : '#BDE6D1' }]} />)}
        </View>
      </View>

      <View style={s.card}>
        <View style={s.ch}><Text style={s.chTxt}>Battery</Text></View>
        <View style={s.batt}>
          <View style={s.battShell}><View style={[s.battFill, { width: '87%' }]} /></View>
          <Text style={s.valN2}>87%</Text>
        </View>
        <Text style={s.sub}>~14 h left</Text>
      </View>

      <View style={s.card}>
        <View style={s.ch}><Text style={s.chTxt}>Movement</Text></View>
        <Text style={s.mv}>Still</Text>
        <View style={s.axes}>
          {[0,1,2].map(i => (
            <View key={i} style={s.axis}>
              <Text style={s.axisLbl}>{['X','Y','Z'][i]}</Text>
              <View style={s.axisTr}><View style={[s.axisFill, { left: '45%', width: '12%' }]} /></View>
            </View>
          ))}
        </View>
      </View>
    </View>
    <Text style={s.disclaim}>Simulated readings · not a medical device</Text>
  </ScrollView>
);

const HistoryTab = () => (
  <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
    <View style={s.minis}>
      <View style={s.mini}><Text style={s.miniS}>Avg HR</Text><Text style={s.miniB}>74<Text style={s.miniEm}> bpm</Text></Text></View>
      <View style={s.mini}><Text style={s.miniS}>Avg SpO₂</Text><Text style={s.miniB}>98<Text style={s.miniEm}> %</Text></Text></View>
    </View>
    <View style={s.hcard}>
      <Text style={s.miniS}>Heart rate · today</Text>
      <View style={s.hbars}>
        {[12,18,14,22,26,20,24,30,28,22,18,14].map((h, i) => <View key={i} style={[s.hbar, { height: h * 2, backgroundColor: i === 7 ? COLORS.sea : '#9ED9BC' }]} />)}
      </View>
      <View style={s.xl}><Text style={s.xlT}>8 AM</Text><Text style={s.xlT}>12 PM</Text><Text style={s.xlT}>4 PM</Text></View>
    </View>
    <View style={s.hcard}>
      <Text style={s.miniS}>SpO₂ · today</Text>
      <View style={s.hbars}>
        {[20,22,18,24,26,22,20,24,26,22,18,20].map((h, i) => <View key={i} style={[s.hbar, { height: h * 2, backgroundColor: '#9ED9BC' }]} />)}
      </View>
      <View style={s.xl}><Text style={s.xlT}>8 AM</Text><Text style={s.xlT}>12 PM</Text><Text style={s.xlT}>4 PM</Text></View>
    </View>
  </ScrollView>
);

const DeviceTab = () => (
  <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
    <View style={s.devhero}>
      <View style={s.devheroIc}>
        <Svg width={28} height={28} viewBox="0 0 64 64" fill="none" stroke="#E6FBF2" strokeWidth={5} strokeLinecap="round">
          <Path d="M12 16c0 18 8 28 20 28s20-10 20-28" />
          <Path d="M32 44v14" />
        </Svg>
      </View>
      <View><Text style={s.devheroB}>Inguardia IG-1</Text><Text style={s.devheroS}>Connected · ••91C0</Text></View>
    </View>
    <View style={s.stats3}>
      <View style={s.stat}><Text style={s.statS}>Battery</Text><Text style={s.statB}>87%</Text></View>
      <View style={s.stat}><Text style={s.statS}>Firmware</Text><Text style={s.statB}>1.4.2</Text></View>
      <View style={s.stat}><Text style={s.statS}>Signal</Text><Text style={s.statB}>−48 dBm</Text></View>
    </View>
    <View style={s.list}>
      <View style={s.row}><Text style={s.rowT}>Notifications</Text><View style={s.swOn}><View style={s.swKnobOn} /></View></View>
      <View style={s.row}><Text style={s.rowT}>Sync readings</Text><View style={s.swOn}><View style={s.swKnobOn} /></View></View>
      <View style={s.row}><Text style={s.rowT}>Units</Text><Text style={s.rowV}>Metric</Text></View>
    </View>
    <TouchableOpacity style={s.disconnect}><Text style={s.disconnectTxt}>Disconnect</Text></TouchableOpacity>
  </ScrollView>
);

const s = StyleSheet.create({
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 10, paddingTop: 6 },
  h2: { flex: 1, fontSize: 20, fontFamily: FONTS.bold, color: COLORS.appInk, letterSpacing: -0.4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: COLORS.mint },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.sea },
  chipTxt: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.seaDeep },
  iconbtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  prof: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingBottom: 6 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.sea, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontSize: 19, fontFamily: FONTS.extrabold },
  profB: { fontSize: 17, fontFamily: FONTS.bold, color: COLORS.appInk },
  profS: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.appInk2 },
  stage3d: { height: 236, marginHorizontal: 14, borderRadius: 28, overflow: 'hidden', backgroundColor: '#E4EEEA', alignItems: 'center', justifyContent: 'center' },
  floor: { position: 'absolute', bottom: 30, left: '50%', marginLeft: -105, width: 210, height: 34, borderRadius: 105, backgroundColor: 'rgba(0,0,0,0.12)' },
  devShape: { marginTop: 16 },
  ovTl: { position: 'absolute', top: 14, left: 16 },
  ovTr: { position: 'absolute', top: 12, right: 12 },
  ovBl: { position: 'absolute', bottom: 13, left: 16 },
  ovBr: { position: 'absolute', bottom: 13, right: 16, opacity: 0.6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 26, paddingHorizontal: 10, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.75)' },
  ovDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.aqua },
  ovTxt: { fontSize: 11, fontFamily: FONTS.bold, color: COLORS.seaDeep },
  cards: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, paddingTop: 10, gap: 10 },
  card: { width: '47.5%', backgroundColor: COLORS.card, borderRadius: 24, borderWidth: 1, borderColor: COLORS.appLine, padding: 14, gap: 8 },
  wide: { width: '100%' },
  ch: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ico: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  chTxt: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.appInk2 },
  aside: { marginLeft: 'auto', fontSize: 11, fontFamily: FONTS.semibold, color: COLORS.appInk2 },
  valRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  valN: { fontSize: 36, fontFamily: FONTS.extrabold, color: COLORS.appInk, letterSpacing: -1.4 },
  valU: { fontSize: 13, fontFamily: FONTS.bold, color: COLORS.appInk2 },
  valN2: { fontSize: 20, fontFamily: FONTS.extrabold, color: COLORS.appInk },
  hrBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 58 },
  hrBar: { flex: 1, backgroundColor: COLORS.heart, borderRadius: 2 },
  qual: { flexDirection: 'row', gap: 3 },
  qBar: { width: 12, height: 4, borderRadius: 2, backgroundColor: COLORS.sea },
  sub: { fontSize: 11.5, fontFamily: FONTS.semibold, color: COLORS.appInk2 },
  bites: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 30 },
  bite: { flex: 1, borderRadius: 3 },
  batt: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  battShell: { width: 54, height: 26, borderRadius: 7, borderWidth: 2, borderColor: COLORS.appInk, padding: 2 },
  battFill: { height: '100%', borderRadius: 4, backgroundColor: COLORS.sea },
  mv: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.sea },
  axes: { gap: 5 },
  axis: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  axisLbl: { fontSize: 10, fontFamily: FONTS.bold, color: COLORS.appInk2, width: 10 },
  axisTr: { flex: 1, height: 5, borderRadius: 3, backgroundColor: COLORS.appLine, overflow: 'hidden' },
  axisFill: { position: 'absolute', top: 0, bottom: 0, backgroundColor: COLORS.sea, borderRadius: 3 },
  navbar: { height: 76, flexDirection: 'row', backgroundColor: '#E6F1EC', paddingTop: 10 },
  navItem: { flex: 1, alignItems: 'center' },
  navPill: { width: 60, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  navPillOn: { backgroundColor: '#B7E4CC' },
  navTxt: { fontSize: 11, fontFamily: FONTS.bold, color: COLORS.appInk2 },
  navTxtOn: { color: COLORS.appInk },
  disclaim: { marginHorizontal: 14, marginTop: 14, fontSize: 10.5, color: COLORS.appInk2, textAlign: 'center', fontFamily: FONTS.regular },
  minis: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingTop: 12 },
  mini: { flex: 1, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.appLine, padding: 12 },
  miniS: { fontSize: 11, fontFamily: FONTS.bold, color: COLORS.appInk2 },
  miniB: { fontSize: 22, fontFamily: FONTS.extrabold, color: COLORS.appInk, marginTop: 4 },
  miniEm: { fontSize: 11, fontFamily: FONTS.regular, color: COLORS.appInk2 },
  hcard: { marginHorizontal: 14, marginTop: 10, backgroundColor: COLORS.card, borderRadius: 24, borderWidth: 1, borderColor: COLORS.appLine, padding: 14 },
  hbars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 70, marginTop: 10 },
  hbar: { flex: 1, backgroundColor: '#9ED9BC', borderRadius: 2 },
  xl: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  xlT: { fontSize: 9.5, fontFamily: FONTS.semibold, color: COLORS.appInk2 },
  devhero: { marginHorizontal: 14, marginTop: 4, padding: 16, borderRadius: 24, backgroundColor: COLORS.seaDeep, flexDirection: 'row', alignItems: 'center', gap: 14 },
  devheroIc: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  devheroB: { fontSize: 17, fontFamily: FONTS.bold, color: '#E6FBF2' },
  devheroS: { fontSize: 12, fontFamily: FONTS.regular, color: '#E6FBF2', opacity: 0.75, marginTop: 2 },
  stats3: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingTop: 10 },
  stat: { flex: 1, backgroundColor: COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: COLORS.appLine, padding: 10 },
  statS: { fontSize: 10.5, fontFamily: FONTS.bold, color: COLORS.appInk2 },
  statB: { fontSize: 16, fontFamily: FONTS.extrabold, color: COLORS.appInk, marginTop: 2 },
  list: { marginHorizontal: 14, marginTop: 10, backgroundColor: COLORS.card, borderRadius: 24, borderWidth: 1, borderColor: COLORS.appLine, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderTopWidth: 1, borderTopColor: COLORS.appLine },
  rowT: { flex: 1, fontSize: 14, fontFamily: FONTS.bold, color: COLORS.appInk },
  rowV: { fontSize: 13, fontFamily: FONTS.semibold, color: COLORS.appInk2 },
  swOn: { width: 44, height: 26, borderRadius: 13, backgroundColor: COLORS.sea, justifyContent: 'center' },
  swKnobOn: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', marginLeft: 21 },
  disconnect: { marginHorizontal: 14, marginTop: 12, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: '#EBC3C4', alignItems: 'center', justifyContent: 'center' },
  disconnectTxt: { color: '#B23A3E', fontSize: 14, fontFamily: FONTS.bold },
});

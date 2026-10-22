import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { COLORS, FONTS } from '../theme';

const StatusBar = () => (
  <View style={s.sbar}>
    <Text style={s.time}>9:41</Text>
    <View style={s.icons}>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.appInk} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M7 7l10 10-5 5V2l5 5L7 17" />
      </Svg>
      <Svg width={16} height={14} viewBox="0 0 24 20" fill={COLORS.appInk}>
        <Path d="M12 18l-11-12a16 16 0 0 1 22 0z" />
      </Svg>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill={COLORS.appInk}>
        <Path d="M22 2v20H2z" />
      </Svg>
      <Svg width={22} height={12} viewBox="0 0 26 13">
        <Rect x={0.75} y={0.75} width={21.5} height={11.5} rx={3} fill="none" stroke={COLORS.appInk} strokeWidth={1.5} />
        <Rect x={3} y={3} width={15} height={7} rx={1.5} fill={COLORS.appInk} />
        <Rect x={23.5} y={4} width={2} height={5} rx={1} fill={COLORS.appInk} />
      </Svg>
    </View>
  </View>
);

export const PhoneFrame = ({ children }: { children: React.ReactNode }) => (
  <View style={s.phone}>
    <View style={s.side1} />
    <View style={s.side2} />
    <View style={s.screen}>
      <View style={s.punch} />
      <StatusBar />
      <View style={s.body}>{children}</View>
      <View style={s.gnav}><View style={s.gnavBar} /></View>
    </View>
  </View>
);

const s = StyleSheet.create({
  phone: { width: 372, height: 780, borderRadius: 48, padding: 9, backgroundColor: '#1a1f1d', position: 'relative', shadowColor: '#08352A', shadowOpacity: 0.55, shadowRadius: 40, shadowOffset: { width: 0, height: 30 }, elevation: 12 },
  side1: { position: 'absolute', right: -3, top: 170, width: 3, height: 64, backgroundColor: '#1d2422', borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  side2: { position: 'absolute', right: -3, top: 260, width: 3, height: 110, backgroundColor: '#1d2422', borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  screen: { flex: 1, borderRadius: 40, backgroundColor: COLORS.appBg, overflow: 'hidden' },
  punch: { position: 'absolute', top: 13, left: '50%', marginLeft: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: '#050807', zIndex: 40 },
  body: { flex: 1 },
  gnav: { height: 22, alignItems: 'center', justifyContent: 'center' },
  gnavBar: { width: 110, height: 4, borderRadius: 4, backgroundColor: COLORS.appInk, opacity: 0.8 },
  sbar: { height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 26, paddingTop: 6 },
  time: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.appInk },
  icons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

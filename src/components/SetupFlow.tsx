import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { COLORS, FONTS } from '../theme';

const MouthIcon = ({ size = 96, stroke = COLORS.sea }: { size?: number; stroke?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 12c0 18 8 28 20 28s20-10 20-28" />
    <Path d="M20 12c0 12 5 20 12 20s12-8 12-20" />
    <Rect x={26} y={40} width={12} height={20} rx={6} fill="#fff" />
    <Path d="M26 47h12" stroke={COLORS.aqua} strokeWidth={3} />
  </Svg>
);

const Check = () => (
  <View style={s.chk}>
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12l5 5 9-10" />
    </Svg>
  </View>
);

const RadarRing = ({ delay }: { delay: number }) => {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.7);
  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(withTiming(2.5, { duration: 3600, easing: Easing.bezier(0.2, 0.6, 0.3, 1) }), -1, false));
    opacity.value = withDelay(delay, withRepeat(withTiming(0, { duration: 3600 }), -1, false));
  }, []);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  return <Animated.View style={[s.ring, st]} />;
};

export const SetupFlow = () => {
  const [step, setStep] = useState(1);
  const [help, setHelp] = useState(false);
  const [weak, setWeak] = useState(false);
  const [cal, setCal] = useState(0);

  const halo = useSharedValue(0);
  useEffect(() => {
    halo.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const haloStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.55 * (1 - halo.value),
    shadowRadius: 22 * halo.value,
  }));

  const next = () => setStep((p) => Math.min(p + 1, 3));
  const runCal = () => {
    if (cal >= 3) return;
    const n = cal + 1;
    setCal(n);
    if (n < 3) setTimeout(runCal, 900);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={s.appbar}>
        <TouchableOpacity style={s.iconbtn} onPress={() => setStep((p) => Math.max(p - 1, 1))}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={COLORS.appInk} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M19 12H5M11 6l-6 6 6 6" />
          </Svg>
        </TouchableOpacity>
        <Text style={s.h2}>Add device</Text>
        <TouchableOpacity style={s.iconbtn} onPress={() => setHelp(true)}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={COLORS.appInk} strokeWidth={2} strokeLinecap="round">
            <Circle cx={12} cy={12} r={9} />
            <Path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.3M12 17h.01" />
          </Svg>
        </TouchableOpacity>
      </View>

      <View style={s.steps}>
        <View style={[s.bar, s.barOn]} />
        <View style={[s.bar, step >= 2 && s.barOn]} />
        <View style={[s.bar, step >= 3 && s.barOn]} />
      </View>
      <View style={s.steplbl}>
        <Text style={[s.lbl, step === 1 && s.lblOn]}>POWER ON</Text>
        <Text style={[s.lbl, step === 2 && s.lblOn]}>PAIR</Text>
        <Text style={[s.lbl, step === 3 && s.lblOn]}>CALIBRATE</Text>
      </View>

      {step === 1 && (
        <View style={{ flex: 1 }}>
          <View style={s.pairH}><Text style={s.h3}>Power on Inguardia</Text><Text style={s.p}>Take the mouthpiece out of its case and hold the green button for 3 seconds.</Text></View>
          <View style={s.power}>
            <View style={s.halo}><Animated.View style={[s.haloRing, haloStyle]} /><MouthIcon /></View>
          </View>
          <View style={s.list}>
            <View style={s.row}><Check /><Text style={s.rowT}>Charged above 20%</Text></View>
            <View style={s.row}><Check /><Text style={s.rowT}>Bluetooth is on</Text></View>
            <View style={s.row}><Check /><Text style={s.rowT}>Nearby-devices permission allowed</Text></View>
          </View>
          <View style={s.cta}><TouchableOpacity style={s.btnBlock} onPress={next}><Text style={s.btnTxt}>Ring light is breathing green</Text></TouchableOpacity></View>
        </View>
      )}

      {step === 2 && (
        <View style={{ flex: 1 }}>
          <View style={s.pairH}><Text style={s.h3}>Pair your mouthpiece</Text><Text style={s.p}>Keep the green light breathing green and your phone within 1 m.</Text></View>
          <View style={s.radar}>
            <RadarRing delay={0} /><RadarRing delay={1200} /><RadarRing delay={2400} />
            <View style={[s.stat, { width: 170, height: 170 }]} />
            <View style={[s.stat, { width: 222, height: 222, opacity: 0.6 }]} />
            <View style={s.core}>
              <MouthIcon size={62} stroke="#fff" />
              <View style={s.bt}><Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.sea} strokeWidth={2.6} strokeLinecap="round"><Path d="M7 7l10 10-5 5V2l5 5L7 17" /></Svg></View>
            </View>
          </View>
          <View style={s.found}><Text style={s.foundLbl}>NEARBY DEVICES</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={s.spin} /><Text style={s.scan}>Scanning</Text></View></View>
          <View style={s.devs}>
            <View style={[s.dev, s.best]}>
              <View style={s.thumb}><MouthIcon size={26} stroke={COLORS.sea} /></View>
              <View style={s.meta}><Text style={s.devB}>Inguardia IG-1</Text><Text style={s.devS}>••91C0 · −81 dBm · weak</Text></View>
              <TouchableOpacity style={s.btnTonal} onPress={() => setWeak(true)}><Text style={s.btnTonalTxt}>Connect</Text></TouchableOpacity>
            </View>
            <View style={s.dev}>
              <View style={s.thumb}><MouthIcon size={26} stroke={COLORS.sea} /></View>
              <View style={s.meta}><Text style={s.devB}>Inguardia IG-1</Text><Text style={s.devS}>••4F2A · −48 dBm</Text></View>
              <TouchableOpacity style={s.btnTonal} onPress={next}><Text style={s.btnTonalTxt}>Connect</Text></TouchableOpacity>
            </View>
            <View style={[s.dev, { opacity: 0.55 }]}>
              <View style={[s.thumb, { backgroundColor: '#EEF1F0' }]}><Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#7d8f88" strokeWidth={2} strokeLinecap="round"><Path d="M3 14v-2a9 9 0 0 1 18 0v2" /><Rect x={3} y={14} width={4} height={6} rx={2} /><Rect x={17} y={14} width={4} height={6} rx={2} /></Svg></View>
              <View style={s.meta}><Text style={s.devB}>Galaxy Buds2</Text><Text style={s.devS}>Not an Inguardia device</Text></View>
            </View>
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={{ flex: 1 }}>
          <View style={s.pairH}><Text style={s.h3}>Quick calibration</Text><Text style={s.p}>Fit the mouthpiece and bite down gently 3 times. Stay still while we read your baseline.</Text></View>
          <View style={s.calib}>
            <Svg width={170} height={170} viewBox="0 0 170 170">
              <Circle cx={85} cy={85} r={74} fill="none" stroke="#E1EEE8" strokeWidth={12} />
              <Circle cx={85} cy={85} r={74} fill="none" stroke={COLORS.sea} strokeWidth={12} strokeLinecap="round" strokeDasharray={[465]} strokeDashoffset={465 - (cal / 3) * 465} rotation={-90} originX={85} originY={85} />
            </Svg>
            <View style={s.calC}><Text style={s.calN}>{cal}</Text><Text style={s.calS}>of 3 bites</Text></View>
          </View>
          <View style={s.list}>
            <View style={s.row}><Text style={s.rowT}>Bite sensor</Text><Text style={[s.st, cal >= 1 && s.stOk]}>{cal >= 1 ? 'Done' : 'Waiting'}</Text></View>
            <View style={s.row}><Text style={s.rowT}>Pulse sensor · HR & SpO₂</Text><Text style={[s.st, cal >= 2 && s.stOk]}>{cal >= 2 ? 'Done' : 'Waiting'}</Text></View>
            <View style={s.row}><Text style={s.rowT}>Temperature</Text><Text style={[s.st, cal >= 3 && s.stOk]}>{cal >= 3 ? 'Done' : 'Waiting'}</Text></View>
          </View>
          <View style={s.cta}>
            <TouchableOpacity style={[s.btnBlock, cal < 3 && { backgroundColor: '#EEF1F0' }]} disabled={cal < 3} onPress={runCal}>
              <Text style={[s.btnTxt, cal < 3 && { color: '#9AAAA4' }]}>{cal < 3 ? 'Waiting for calibration' : 'Start monitoring'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnText} onPress={() => setStep(1)}><Text style={s.btnTextTxt}>Skip for now</Text></TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={help} transparent animationType="slide">
        <Pressable style={s.scrim} onPress={() => setHelp(false)} />
        <View style={s.panel}>
          <View style={s.grab} />
          <Text style={s.panelH}>Can not find your mouthpiece?</Text>
          <Text style={s.panelP}>1. Charge it for 10 minutes in its case.{'\n'}2. Hold the green button for 3 s until the green light breathes green.{'\n'}3. Move within 1 m of your phone, away from other Bluetooth devices.{'\n'}4. If it is paired to another phone, remove it there first.</Text>
          <View style={s.acts}>
            <TouchableOpacity style={s.btnTonal} onPress={() => setHelp(false)}><Text style={s.btnTonalTxt}>Bluetooth settings</Text></TouchableOpacity>
            <TouchableOpacity style={s.btnPrimary} onPress={() => setHelp(false)}><Text style={s.btnPrimaryTxt}>Got it</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={weak} transparent animationType="slide">
        <Pressable style={s.scrim} onPress={() => setWeak(false)} />
        <View style={s.panel}>
          <View style={s.grab} />
          <Text style={s.panelH}>Weak signal (−81 dBm)</Text>
          <Text style={s.panelP}>This mouthpiece is far from your phone, so readings may drop out. Move closer before pairing for a stable connection.</Text>
          <View style={s.acts}>
            <TouchableOpacity style={s.btnTonal} onPress={() => setWeak(false)}><Text style={s.btnTonalTxt}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={s.btnPrimary} onPress={() => { setWeak(false); next(); }}><Text style={s.btnPrimaryTxt}>Connect anyway</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 10, paddingTop: 6 },
  h2: { flex: 1, fontSize: 20, fontFamily: FONTS.bold, color: COLORS.appInk, letterSpacing: -0.4 },
  iconbtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  steps: { flexDirection: 'row', gap: 6, paddingHorizontal: 20 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.appLine },
  barOn: { backgroundColor: COLORS.sea },
  steplbl: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  lbl: { fontSize: 11, fontFamily: FONTS.bold, color: COLORS.appInk2, letterSpacing: 0.04 },
  lblOn: { color: COLORS.sea },
  pairH: { paddingHorizontal: 20, paddingTop: 22 },
  h3: { fontSize: 26, fontFamily: FONTS.bold, color: COLORS.appInk, letterSpacing: -0.8 },
  p: { marginTop: 8, fontSize: 14, lineHeight: 21, color: COLORS.appInk2, fontFamily: FONTS.regular },
  power: { height: 230, alignItems: 'center', justifyContent: 'center' },
  halo: { width: 170, height: 170, borderRadius: 85, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F6EC' },
  haloRing: { position: 'absolute', top: 18, left: 18, right: 18, bottom: 18, borderRadius: 85, shadowColor: COLORS.aqua, shadowOpacity: 0.55, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } },
  list: { marginHorizontal: 14, backgroundColor: COLORS.card, borderRadius: 24, borderWidth: 1, borderColor: COLORS.appLine, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderTopWidth: 1, borderTopColor: COLORS.appLine },
  rowT: { flex: 1, fontSize: 14, fontFamily: FONTS.bold, color: COLORS.appInk },
  chk: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.sea, alignItems: 'center', justifyContent: 'center' },
  cta: { marginTop: 'auto', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, gap: 6 },
  btnBlock: { height: 48, borderRadius: 24, backgroundColor: COLORS.sea, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: '#fff', fontSize: 14, fontFamily: FONTS.bold },
  btnText: { height: 40, alignItems: 'center', justifyContent: 'center' },
  btnTextTxt: { color: COLORS.sea, fontSize: 13, fontFamily: FONTS.bold },
  radar: { height: 232, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1.5, borderColor: COLORS.sea },
  stat: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: '#BFDCCD', borderStyle: 'dashed' },
  core: { width: 104, height: 104, borderRadius: 52, backgroundColor: COLORS.sea, alignItems: 'center', justifyContent: 'center' },
  bt: { position: 'absolute', right: -2, top: 6, width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  found: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  foundLbl: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.appInk2, letterSpacing: 0.05 },
  scan: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.sea },
  spin: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: COLORS.mint, borderTopColor: COLORS.sea },
  devs: { paddingHorizontal: 14, gap: 10 },
  dev: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.appLine },
  best: { borderColor: '#9FD8BC' },
  thumb: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.mint, alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1 },
  devB: { fontSize: 14, fontFamily: FONTS.bold, color: COLORS.appInk },
  devS: { fontSize: 11.5, color: COLORS.appInk2, fontFamily: FONTS.regular, marginTop: 3 },
  btnTonal: { height: 40, paddingHorizontal: 18, borderRadius: 20, backgroundColor: COLORS.mint, alignItems: 'center', justifyContent: 'center' },
  btnTonalTxt: { color: COLORS.seaDeep, fontSize: 13, fontFamily: FONTS.bold },
  btnPrimary: { height: 46, flex: 1, borderRadius: 23, backgroundColor: COLORS.sea, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryTxt: { color: '#fff', fontSize: 13, fontFamily: FONTS.bold },
  calib: { height: 210, alignItems: 'center', justifyContent: 'center' },
  calC: { position: 'absolute', alignItems: 'center' },
  calN: { fontSize: 44, fontFamily: FONTS.extrabold, color: COLORS.appInk, letterSpacing: -1.8 },
  calS: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.appInk2 },
  st: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.appInk2 },
  stOk: { color: COLORS.sea },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6,30,24,0.42)' },
  panel: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 34 },
  grab: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#CFDDD6', alignSelf: 'center', marginBottom: 16 },
  panelH: { fontSize: 19, fontFamily: FONTS.bold, color: COLORS.appInk, marginBottom: 6 },
  panelP: { fontSize: 13.5, lineHeight: 20, color: COLORS.appInk2, fontFamily: FONTS.regular, marginBottom: 16 },
  acts: { flexDirection: 'row', gap: 10 },
});

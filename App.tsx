import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Modal,
  Animated,
  Easing,
} from 'react-native';

const C = {
  bg: '#F2F8F5',
  card: '#FFFFFF',
  sea: '#2E8B57',
  seaDeep: '#0F4C3A',
  seaInk: '#08352A',
  mint: '#D6F2E4',
  aqua: '#3CC8A0',
  ink: '#0E2A22',
  ink2: '#5B7A6F',
  line: '#E1EEE8',
  heart: '#E5484D',
  warn: '#E8A33D',
};

function SpinningScan() {
  const rotate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotate]);
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.View style={[st.spinCircle, { transform: [{ rotate: spin }] }]} />;
}

function SignalBars({ strength }) {
  const a1 = useRef(new Animated.Value(0.4)).current;
  const a2 = useRef(new Animated.Value(0.4)).current;
  const a3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const makePulse = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0.4, duration: 500, useNativeDriver: false }),
          Animated.delay(800),
        ]),
      );
    const p1 = makePulse(a1, 0);
    const p2 = makePulse(a2, 250);
    const p3 = makePulse(a3, 500);
    p1.start();
    if (strength >= 2) p2.start();
    if (strength >= 3) p3.start();
    return () => { p1.stop(); p2.stop(); p3.stop(); };
  }, [a1, a2, a3, strength]);

  const heights = [4, 7, 10];
  const anims = [a1, a2, a3];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 10 }}>
      {heights.map((h, i) => {
        const isOn = i < strength;
        const anim = anims[i];
        if (!isOn) return <View key={i} style={{ width: 3, height: h, borderRadius: 1, backgroundColor: '#CFE1D8' }} />;
        const height = anim.interpolate({ inputRange: [0.4, 1], outputRange: [h * 0.5, h] });
        return <Animated.View key={i} style={{ width: 3, height, borderRadius: 1, backgroundColor: '#2E8B57', opacity: anim }} />;
      })}
    </View>
  );
}

function RadarPulse() {
  const r1 = useRef(new Animated.Value(0)).current;
  const r2 = useRef(new Animated.Value(0)).current;
  const r3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makePulse = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 3600, easing: Easing.bezier(0.2, 0.6, 0.3, 1), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      );
    const p1 = makePulse(r1, 0); const p2 = makePulse(r2, 1200); const p3 = makePulse(r3, 2400);
    p1.start(); p2.start(); p3.start();
    return () => { p1.stop(); p2.stop(); p3.stop(); };
  }, [r1, r2, r3]);

  const rings = [r1, r2, r3];
  return (
    <View style={rp.wrap} pointerEvents="none">
      {rings.map((anim, i) => {
        const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.5] });
        const opacity = anim.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.7, 0] });
        return <Animated.View key={i} style={[rp.ring, { opacity, transform: [{ scale }] }]} />;
      })}
    </View>
  );
}

function MovingAxisBar({ minW, maxW, duration }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    ).start();
  }, [anim, duration]);
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: [minW + '%', maxW + '%'] });
  return <View style={st.axisTrack}><Animated.View style={[st.axisFillLeft, { width }]} /></View>;
}

function StreamingDot() {
  const w1 = useRef(new Animated.Value(0)).current;
  const w2 = useRef(new Animated.Value(0)).current;
  const w3 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const makeWave = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      );
    const p1 = makeWave(w1, 0); const p2 = makeWave(w2, 600); const p3 = makeWave(w3, 1200);
    p1.start(); p2.start(); p3.start();
    return () => { p1.stop(); p2.stop(); p3.stop(); };
  }, [w1, w2, w3]);
  const waves = [w1, w2, w3];
  return (
    <View style={sd.wrap}>
      {waves.map((anim, i) => {
        const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 3.5] });
        const opacity = anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.8, 0] });
        return <Animated.View key={i} style={[sd.wave, { opacity, transform: [{ scale }] }]} pointerEvents="none" />;
      })}
      <View style={sd.dot} />
    </View>
  );
}

function PumpingHeart() {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.35, duration: 150, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 250, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.delay(400),
      ]),
    ).start();
  }, [scale]);
  return <Animated.Text style={{ fontSize: 14, color: C.heart, transform: [{ scale }] }}>❤</Animated.Text>;
}

// Replaced SVG with Pure React Native Bars for the ECG
function SmoothECGWave({ hr }) {
  const [bars, setBars] = useState([...Array(20)].map(() => Math.random() * 20 + 10));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => {
        const next = [...prev.slice(1)];
        const isPeak = Math.random() > 0.7;
        next.push(isPeak ? 45 : Math.random() * 20 + 10);
        return next;
      });
    }, Math.max(300, 60000 / hr / 2));
    return () => clearInterval(interval);
  }, [hr]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 40, flex: 1, gap: 2, overflow: 'hidden' }}>
      {bars.map((h, i) => (
        <View key={i} style={{ flex: 1, height: h, backgroundColor: C.heart, borderRadius: 2, opacity: 0.8 }} />
      ))}
    </View>
  );
}

export default function App() {
  const [phase, setPhase] = useState('setup');
  const [screen, setScreen] = useState('live');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      {phase === 'setup' && <SetupFlow onComplete={() => setPhase('app')} />}
      {phase === 'app' && (
        <View style={{ flex: 1 }}>
          {screen === 'live' && <LiveScreen />}
          {screen === 'history' && <HistoryScreen />}
          {screen === 'device' && <DeviceScreen toast={showToast} />}
          <BottomNav active={screen} onChange={setScreen} />
        </View>
      )}
      {toast !== '' && <View style={st.toastBox} pointerEvents="none"><Text style={st.toastText}>{toast}</Text></View>}
    </SafeAreaView>
  );
}

function SetupFlow({ onComplete }) {
  const [step, setStep] = useState(2);
  const [helpOpen, setHelpOpen] = useState(false);
  const [weakOpen, setWeakOpen] = useState(false);
  const [pairing, setPairing] = useState(false);
  const [paired, setPaired] = useState(false);
  const [bites, setBites] = useState(0);

  useEffect(() => {
    if (step !== 3 || bites >= 3) return;
    const t = setTimeout(() => setBites(b => b + 1), 1200);
    return () => clearTimeout(t);
  }, [step, bites]);

  const goPair = () => {
    if (pairing || paired) return;
    setPairing(true);
    setTimeout(() => {
      setPaired(true);
      setTimeout(() => { setPairing(false); setPaired(false); setBites(0); setStep(3); }, 700);
    }, 1400);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={st.appbar}>
        <TouchableOpacity style={st.iconBtn} onPress={() => step > 1 && setStep(step - 1)}><Text style={st.iconText}>←</Text></TouchableOpacity>
        <Text style={[st.appTitle, { flex: 1, textAlign: 'center' }]}>Add device</Text>
        <TouchableOpacity style={st.iconBtn} onPress={() => setHelpOpen(true)}><Text style={st.iconText}>?</Text></TouchableOpacity>
      </View>

      <View style={st.stepsBars}>
        <View style={[st.stepBar, step >= 1 && st.stepBarOn]} /><View style={[st.stepBar, step >= 2 && st.stepBarOn]} /><View style={[st.stepBar, step >= 3 && st.stepBarOn]} />
      </View>
      <View style={st.stepsLabels}>
        <Text style={[st.stepLbl, step === 1 && st.stepLblOn]}>POWER ON</Text>
        <Text style={[st.stepLbl, step === 2 && st.stepLblOn]}>PAIR</Text>
        <Text style={[st.stepLbl, step === 3 && st.stepLblOn]}>CALIBRATE</Text>
      </View>

      {step === 1 && (
        <ScrollView contentContainerStyle={st.scroll}>
          <Text style={st.h1}>Power on Inguardia</Text>
          <Text style={st.h1sub}>Take the mouthpiece out of its case and hold the green button for 3 seconds.</Text>
          <View style={st.powerWrap}><View style={st.powerHalo}><View style={st.powerCore}><Text style={st.powerIcon}>⚡</Text></View></View></View>
          <View style={st.list}>
            {['Charged above 20%', 'Bluetooth is on', 'Nearby-devices permission allowed'].map(t => (
              <View key={t} style={st.rowItem}><View style={st.chk}><Text style={st.chkTick}>✓</Text></View><Text style={st.rowTitle}>{t}</Text></View>
            ))}
          </View>
          <TouchableOpacity style={st.btnPrimary} onPress={() => setStep(2)}><Text style={st.btnPrimaryText}>Ring light is breathing green</Text></TouchableOpacity>
        </ScrollView>
      )}

      {step === 2 && (
        <ScrollView contentContainerStyle={st.scroll}>
          <Text style={st.h1}>Pair your mouthpiece</Text>
          <Text style={st.h1sub}>Keep the green light breathing green and your phone within 1 m.</Text>
          <View style={st.radarWrap}><RadarPulse /><View style={st.radarCore}><Text style={st.radarIcon}>ᛉ</Text><View style={st.btBadge}><Text style={st.btIcon}>ᛒ</Text></View></View></View>
          <View style={st.foundRow}><Text style={st.foundLbl}>NEARBY DEVICES</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><SpinningScan /><Text style={st.scanTxt}>Scanning</Text></View></View>
          <View style={[st.devCard, { borderColor: '#9FD8BC' }]}>
            <View style={st.devThumb}><Text style={st.devThumbIcon}>ᛉ</Text></View>
            <View style={{ flex: 1 }}><Text style={st.devName}>Inguardia IG-1</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}><Text style={st.devMeta}>••4F2A ·</Text><SignalBars strength={3} /><Text style={st.devMeta}>−48 dBm</Text></View></View>
            <TouchableOpacity style={[st.btnPrimarySm, (pairing || paired) && { opacity: 0.7 }]} disabled={pairing || paired} onPress={goPair}><Text style={st.btnPrimaryText}>{paired ? 'Paired ✓' : pairing ? 'Pairing' : 'Connect'}</Text></TouchableOpacity>
          </View>
          <View style={st.devCard}>
            <View style={st.devThumb}><Text style={st.devThumbIcon}>ᛉ</Text></View>
            <View style={{ flex: 1 }}><Text style={st.devName}>Inguardia IG-1</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}><Text style={st.devMeta}>••91C0 ·</Text><SignalBars strength={1} /><Text style={st.devMeta}>−81 dBm · weak</Text></View></View>
            <TouchableOpacity style={st.btnTonalSm} onPress={() => setWeakOpen(true)}><Text style={st.btnTonalText}>Connect</Text></TouchableOpacity>
          </View>
          <View style={[st.devCard, { opacity: 0.55 }]}><View style={[st.devThumb, { backgroundColor: '#EEF1F0' }]}><Text style={{ fontSize: 20 }}>🎧</Text></View><View style={{ flex: 1 }}><Text style={st.devName}>Galaxy Buds2</Text><Text style={st.devMeta}>Not an Inguardia device</Text></View></View>
        </ScrollView>
      )}

      {step === 3 && (
        <ScrollView contentContainerStyle={st.scroll}>
          <Text style={st.h1}>{bites >= 3 ? 'Calibration complete' : 'Quick calibration'}</Text>
          <Text style={st.h1sub}>{bites >= 3 ? 'Baseline saved. You can recalibrate at any time from the Device tab.' : 'Fit the mouthpiece and bite down gently 3 times. Stay still while we read your baseline.'}</Text>
          <View style={st.calibWrap}>
            <View style={[st.calibRing, { borderTopColor: bites >= 1 ? C.sea : C.line, borderRightColor: bites >= 2 ? C.sea : C.line, borderBottomColor: bites >= 3 ? C.sea : C.line, borderLeftColor: bites >= 3 ? C.sea : C.line }]} />
            <View style={st.calibInner}><Text style={st.calibNumber}>{bites}</Text><Text style={st.calibLabel}>of 3 bites</Text></View>
          </View>
          <View style={st.list}>
            {['Bite sensor', 'Pulse sensor · HR & SpO₂', 'Temperature'].map((name, i) => (
              <View key={name} style={st.rowItem}><Text style={st.rowTitle}>{name}</Text><Text style={bites > i ? st.stReady : st.stWait}>{bites > i ? '✓ Ready' : 'Waiting'}</Text></View>
            ))}
          </View>
          <TouchableOpacity style={[st.btnPrimary, bites < 3 && { backgroundColor: '#EEF1F0' }]} disabled={bites < 3} onPress={onComplete}><Text style={[st.btnPrimaryText, bites < 3 && { color: '#9AAAA4' }]}>Start monitoring</Text></TouchableOpacity>
          <TouchableOpacity style={st.btnText} onPress={onComplete}><Text style={st.btnTextLabel}>Skip for now</Text></TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={helpOpen} transparent animationType="slide" onRequestClose={() => setHelpOpen(false)}>
        <View style={st.sheetScrim}><View style={st.sheetPanel}><View style={st.grab} /><Text style={st.sheetTitle}>Can't find your mouthpiece?</Text><Text style={st.sheetText}>1. Charge it for 10 minutes in its case.{'\n'}2. Hold the green button for 3 s until the light breathes green.{'\n'}3. Move within 1 m of your phone.{'\n'}4. If it's paired to another phone, remove it there first.</Text><View style={st.sheetActs}><TouchableOpacity style={st.btnTonal} onPress={() => setHelpOpen(false)}><Text style={st.btnTonalText}>Bluetooth settings</Text></TouchableOpacity><TouchableOpacity style={st.btnPrimarySm} onPress={() => setHelpOpen(false)}><Text style={st.btnPrimaryText}>Got it</Text></TouchableOpacity></View></View></View>
      </Modal>

      <Modal visible={weakOpen} transparent animationType="slide" onRequestClose={() => setWeakOpen(false)}>
        <View style={st.sheetScrim}><View style={st.sheetPanel}><View style={st.grab} /><Text style={st.sheetTitle}>Weak signal (−81 dBm)</Text><Text style={st.sheetText}>This mouthpiece is far from your phone, so readings may drop out. Move closer before pairing.</Text><View style={st.sheetActs}><TouchableOpacity style={st.btnTonal} onPress={() => setWeakOpen(false)}><Text style={st.btnTonalText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={st.btnPrimarySm} onPress={() => { setWeakOpen(false); goPair(); }}><Text style={st.btnPrimaryText}>Connect anyway</Text></TouchableOpacity></View></View></View>
      </Modal>
    </View>
  );
}

function LiveScreen() {
  const [hr, setHr] = useState(72);
  const [spo, setSpo] = useState(98);
  const [temp, setTemp] = useState(36.8);
  const [bites, setBites] = useState(146);
  const [battery, setBattery] = useState(82);
  const [moving, setMoving] = useState(true);
  const [unit, setUnit] = useState('C');
  const [biteBars, setBiteBars] = useState([1, 3, 2, 4, 2, 3, 1, 4, 2, 3, 2, 4, 3, 2]);

  useEffect(() => {
    const t = setInterval(() => setHr(v => Math.max(62, Math.min(86, v + Math.round((Math.random() - 0.5) * 3)))), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => { setSpo(97 + Math.round(Math.random() * 2)); setTemp(v => Math.max(36.4, Math.min(37.2, v + (Math.random() - 0.5) * 0.1))); }, 3000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => { if (Math.random() < 0.35) { setBites(v => v + 1); setBiteBars(prev => { const next = [...prev]; next[next.length - 1] += 1; return next; }); } }, 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setMoving(m => !m), 7000); return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setBattery(v => (v > 20 ? v - 1 : v)), 20000); return () => clearInterval(t);
  }, []);

  const fmtT = (c) => (unit === 'C' ? c.toFixed(1) : ((c * 9) / 5 + 32).toFixed(1));

  return (
    <ScrollView contentContainerStyle={st.scroll}>
      <View style={st.appbar}><Text style={[st.appTitle, { flex: 1 }]}>Live monitor</Text><View style={st.chip}><View style={st.chipDot} /><Text style={st.chipText}>Connected</Text></View><TouchableOpacity style={st.iconBtn}><Text style={st.iconText}>⋮</Text></TouchableOpacity></View>

      <View style={st.stage3d}>
        <View style={st.ovTL}><Text style={st.ovTLText}>Inguardia IG-1 <Text style={{ opacity: 0.6 }}>FW 2.4.1</Text></Text></View>
        <View style={st.ovTR}><View style={st.pillDk}><View style={st.battMini}><View style={[st.battMiniFill, { width: `${battery}%` }]} /></View><Text style={st.battTxt}>{battery}%</Text></View></View>
        <Device3D />
        <View style={st.ovBL}><View style={st.pillDk}><StreamingDot /><Text style={st.streamTxt}>Streaming · 25 Hz</Text></View></View>
        <Text style={st.ovBR}>Drag to rotate</Text>
      </View>

      <View style={st.card}>
        <View style={st.ch}><View style={[st.chIco, { backgroundColor: '#FDE7E8' }]}><PumpingHeart /></View><Text style={st.chTitle}>Heart rate</Text><Text style={st.chAside}>updated now</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View><View style={st.valRow}><Text style={st.valNum}>{hr}</Text><Text style={st.valUnit}>BPM</Text></View><Text style={st.subText}>Resting range · 58–84</Text></View>
          <SmoothECGWave hr={hr} />
        </View>
      </View>

      <View style={st.gridRow}>
        <View style={st.cardHalf}>
          <View style={st.ch}><View style={[st.chIco, { backgroundColor: '#DDF0FB' }]}><Text style={{ fontSize: 14, color: '#2E86C1' }}>💧</Text></View><Text style={st.chTitle}>SpO₂</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}><View style={st.spoCircle}><Text style={{ fontSize: 16, fontWeight: '900', color: C.ink }}>{spo}</Text></View><Text style={{ fontSize: 18, fontWeight: '700', color: C.ink2 }}>%</Text></View>
          <Text style={st.subText}>Signal · good</Text>
        </View>
        <View style={st.cardHalf}>
          <View style={st.ch}><View style={[st.chIco, { backgroundColor: '#FDEEE3' }]}><Text style={{ fontSize: 14, color: '#D2691E' }}>🌡</Text></View><Text style={st.chTitle}>Temperature</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 }}><Text style={[st.valNum, { fontSize: 26 }]}>{fmtT(temp)}</Text><Text style={st.valUnit}>°{unit}</Text></View>
          <View style={st.unitSeg}><TouchableOpacity style={[st.unitSegBtn, unit === 'C' && st.unitSegBtnOn]} onPress={() => setUnit('C')}><Text style={[st.unitSegText, unit === 'C' && st.unitSegTextOn]}>°C</Text></TouchableOpacity><TouchableOpacity style={[st.unitSegBtn, unit === 'F' && st.unitSegBtnOn]} onPress={() => setUnit('F')}><Text style={[st.unitSegText, unit === 'F' && st.unitSegTextOn]}>°F</Text></TouchableOpacity></View>
          <Text style={st.subText}>Oral · 36.1–37.5</Text>
        </View>
      </View>

      <View style={st.gridRow}>
        <View style={st.cardHalf}>
          <View style={st.ch}><View style={[st.chIco, { backgroundColor: C.mint }]}><Text style={{ fontSize: 14, color: C.sea }}>🦷</Text></View><Text style={st.chTitle}>Bite count</Text></View>
          <View style={st.valRow}><Text style={[st.valNum, { fontSize: 26 }]}>{bites}</Text><Text style={st.valUnit}>today</Text></View>
          <View style={st.biteBarsWrap}>{biteBars.map((v, i) => (<View key={i} style={[st.biteBar, { height: 6 + Math.min(v, 5) * 4.5, backgroundColor: i === biteBars.length - 1 ? C.sea : '#BDE6D1' }]} />))}</View>
          <Text style={st.subText}>+{biteBars[biteBars.length - 1]} last minute</Text>
        </View>
        <View style={st.cardHalf}>
          <View style={st.ch}><View style={[st.chIco, { backgroundColor: '#E6F4EC' }]}><Text style={{ fontSize: 14, color: C.sea }}>⚡</Text></View><Text style={st.chTitle}>Battery</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}><View style={st.battShell}><View style={[st.battFill, { width: `${battery}%` }]} /></View><Text style={[st.valNum, { fontSize: 22, marginLeft: 8 }]}>{battery}%</Text></View>
          <Text style={st.subText}>≈ 9 h 10 m remaining</Text>
        </View>
      </View>

      <View style={st.card}>
        <View style={st.ch}><View style={[st.chIco, { backgroundColor: '#FFF2DC' }]}><Text style={{ fontSize: 14, color: '#C07A12' }}>✦</Text></View><Text style={st.chTitle}>Movement</Text><Text style={st.chAside}>IMU · g</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6 }}>
          <View style={[st.mvPill, { backgroundColor: moving ? '#FFF2DC' : C.mint }]}><Text style={[st.mvText, { color: moving ? '#C07A12' : C.seaDeep }]}>● {moving ? 'Moving' : 'Still'}</Text></View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={st.axisRow}><Text style={st.axisLbl}>X</Text><MovingAxisBar minW={25} maxW={75} duration={2200} /></View>
            <View style={st.axisRow}><Text style={st.axisLbl}>Y</Text><MovingAxisBar minW={30} maxW={85} duration={1800} /></View>
            <View style={st.axisRow}><Text style={st.axisLbl}>Z</Text><MovingAxisBar minW={20} maxW={65} duration={2600} /></View>
          </View>
        </View>
      </View>
      <Text style={st.disclaim}>Wellness readings, not a diagnosis. Values refresh every second while connected.</Text>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// Pure View 3D Device Mockup
function Device3D() {
  const floatY = useRef(new Animated.Value(0)).current;
  const ledOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(ledOpacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(ledOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [floatY, ledOpacity]);

  const translateY = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', bottom: 30, width: 160, height: 18, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.18)' }} />
      <Animated.View style={{ width: 140, height: 100, backgroundColor: '#fff', borderRadius: 30, transform: [{ translateY }], alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}>
         <Text style={{ fontSize: 40, color: C.sea }}>ᛉ</Text>
      </Animated.View>
      <Animated.View style={{ position: 'absolute', top: '55%', left: '60%', width: 8, height: 8, borderRadius: 4, backgroundColor: '#5fd38d', opacity: ledOpacity, shadowColor: '#5fd38d', shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }} pointerEvents="none" />
    </View>
  );
}

function HistoryScreen() {
  const [range, setRange] = useState('day');
  const data = { day: { avg: 68, spo: 95, bites: '412', temp: 36.7, n: 24 }, week: { avg: 70, spo: 94, bites: '2,604', temp: 36.8, n: 7 }, month: { avg: 69, spo: 94, bites: '11,380', temp: 36.7, n: 30 } }[range];
  const bars = Array.from({ length: data.n }, (_, i) => range === 'day' ? (i < 7 ? 40 + Math.random() * 40 : 10 + Math.random() * 20) : 30 + Math.random() * 60);
  const maxBar = Math.max(...bars);

  return (
    <ScrollView contentContainerStyle={st.scroll}>
      <View style={st.appbar}><Text style={[st.appTitle, { flex: 1 }]}>History</Text><View style={st.chip}><View style={st.chipDot} /><Text style={st.chipText}>Connected</Text></View><TouchableOpacity style={st.iconBtn}><Text style={st.iconText}>⋮</Text></TouchableOpacity></View>
      <View style={st.seg}>{['day', 'week', 'month'].map(r => (<TouchableOpacity key={r} style={[st.segBtn, range === r && st.segBtnOn]} onPress={() => setRange(r)}><Text style={[st.segText, range === r && st.segTextOn]}>{r === 'day' ? 'Day' : r === 'week' ? 'Week' : 'Month'}</Text></TouchableOpacity>))}</View>
      <View style={st.miniRow}><View style={st.mini}><Text style={st.miniLabel}>Avg heart rate</Text><View style={{ flexDirection: 'row', alignItems: 'baseline' }}><Text style={st.miniValue}>{data.avg}</Text><Text style={st.miniUnit}>bpm</Text></View></View><View style={st.mini}><Text style={st.miniLabel}>Lowest SpO₂</Text><View style={{ flexDirection: 'row', alignItems: 'baseline' }}><Text style={st.miniValue}>{data.spo}</Text><Text style={st.miniUnit}>%</Text></View></View></View>
      <View style={st.miniRow}><View style={st.mini}><Text style={st.miniLabel}>Bites</Text><Text style={st.miniValue}>{data.bites}</Text></View><View style={st.mini}><Text style={st.miniLabel}>Avg temperature</Text><View style={{ flexDirection: 'row', alignItems: 'baseline' }}><Text style={st.miniValue}>{data.temp.toFixed(1)}</Text><Text style={st.miniUnit}>°C</Text></View></View></View>
      <View style={st.hcard}><View style={st.ch}><Text style={st.chTitle}>Bites</Text><Text style={st.chAside}>{range === 'day' ? 'most between 00:00 and 07:00' : 'darker = busiest'}</Text></View><View style={st.hBars}>{bars.map((v, i) => (<View key={i} style={[st.hBar, { height: `${(v / maxBar) * 100}%`, backgroundColor: v > maxBar * 0.75 ? C.sea : '#9ED9BC' }]} />))}</View></View>
      <Text style={st.sect}>RECENT SESSIONS</Text>
      <View style={st.list}>{[{ t: 'Last night', sub: '23:10 – 06:52 · 7 h 42 m · 212 bites', ok: true }, { t: 'Mon 21 Sep', sub: '23:40 – 07:05 · 7 h 25 m · 188 bites', ok: true }, { t: 'Sun 20 Sep', sub: '00:15 – 06:30 · 6 h 15 m · 341 bites', ok: false }].map((it, i) => (<View key={i} style={st.rowItem}><View style={st.sessionIco}><Text style={{ fontSize: 14 }}>🌙</Text></View><View style={{ flex: 1 }}><Text style={st.rowTitle}>{it.t}</Text><Text style={st.rowSub}>{it.sub}</Text></View><Text style={[st.stReady, !it.ok && { color: '#C07A12' }]}>{it.ok ? 'Normal' : 'High bites'}</Text></View>))}</View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function DeviceScreen({ toast }) {
  const [live, setLive] = useState(true);
  const [clench, setClench] = useState(true);
  const [autoSync, setAutoSync] = useState(false);
  const [rate, setRate] = useState('25');
  const [unit, setUnit] = useState('C');
  return (
    <ScrollView contentContainerStyle={st.scroll}>
      <View style={st.appbar}><Text style={[st.appTitle, { flex: 1 }]}>Device</Text><View style={st.chip}><View style={st.chipDot} /><Text style={st.chipText}>Connected</Text></View><TouchableOpacity style={st.iconBtn}><Text style={st.iconText}>⋮</Text></TouchableOpacity></View>
      <View style={st.devHero}><View style={st.devHeroIcon}><Text style={{ fontSize: 26, color: '#fff' }}>ᛉ</Text></View><View style={{ flex: 1 }}><Text style={st.devHeroTitle}>Inguardia IG-1</Text><Text style={st.devHeroSub}>SN IG1-24-004F2A</Text><Text style={st.devHeroSub}>Connected · −48 dBm</Text></View></View>
      <View style={st.stats3}><View style={st.stat3}><Text style={st.stat3Label}>Battery</Text><Text style={st.stat3Value}>82%</Text></View><View style={st.stat3}><Text style={st.stat3Label}>Firmware</Text><Text style={st.stat3Value}>2.4.1</Text></View><View style={st.stat3}><Text style={st.stat3Label}>Storage</Text><Text style={st.stat3Value}>64%</Text></View></View>
      <Text style={st.sect}>ACTIONS</Text>
      <View style={st.list}>
        <TouchableOpacity style={st.rowItem} onPress={() => toast('Ring light is blinking')}><View style={st.actionIco}><Text style={{ fontSize: 16 }}>📡</Text></View><View style={{ flex: 1 }}><Text style={st.rowTitle}>Find my device</Text><Text style={st.rowSub}>Blinks the green light for 5 s</Text></View><Text style={st.chev}>›</Text></TouchableOpacity>
        <TouchableOpacity style={st.rowItem} onPress={() => toast('Recalibrating…')}><View style={st.actionIco}><Text style={{ fontSize: 16 }}>🔄</Text></View><View style={{ flex: 1 }}><Text style={st.rowTitle}>Recalibrate sensors</Text><Text style={st.rowSub}>Last calibrated today, 9:41</Text></View><Text style={st.chev}>›</Text></TouchableOpacity>
        <TouchableOpacity style={st.rowItem} onPress={() => toast('Up to date · 2.4.1')}><View style={st.actionIco}><Text style={{ fontSize: 16 }}>⬇️</Text></View><View style={{ flex: 1 }}><Text style={st.rowTitle}>Check for firmware update</Text><Text style={st.rowSub}>Installed 2.4.1</Text></View><Text style={st.chev}>›</Text></TouchableOpacity>
      </View>
      <Text style={st.sect}>SETTINGS</Text>
      <View style={st.list}>
        <View style={st.rowItem}><View style={{ flex: 1 }}><Text style={st.rowTitle}>Live streaming</Text><Text style={st.rowSub}>Send readings to this phone in real time</Text></View><Switch value={live} onValueChange={setLive} trackColor={{ false: '#C9D8D1', true: C.sea }} thumbColor="#fff" /></View>
        <View style={st.rowItem}><View style={{ flex: 1 }}><Text style={st.rowTitle}>Clench alert vibration</Text><Text style={st.rowSub}>Buzz gently after 5 hard bites in a row</Text></View><Switch value={clench} onValueChange={setClench} trackColor={{ false: '#C9D8D1', true: C.sea }} thumbColor="#fff" /></View>
        <View style={st.rowItem}><View style={{ flex: 1 }}><Text style={st.rowTitle}>Auto-sync</Text><Text style={st.rowSub}>Back up sessions when on Wi-Fi</Text></View><Switch value={autoSync} onValueChange={setAutoSync} trackColor={{ false: '#C9D8D1', true: C.sea }} thumbColor="#fff" /></View>
        <View style={[st.rowItem, { flexDirection: 'column', alignItems: 'stretch' }]}><Text style={st.rowTitle}>Sample rate</Text><Text style={st.rowSub}>Higher rates use more battery</Text><View style={[st.seg, { marginTop: 10, marginBottom: 0 }]}>{['10', '25', '50'].map(r => (<TouchableOpacity key={r} style={[st.segBtn, rate === r && st.segBtnOn]} onPress={() => setRate(r)}><Text style={[st.segText, rate === r && st.segTextOn]}>{r} Hz</Text></TouchableOpacity>))}</View></View>
      </View>
      <Text style={st.sect}>UNITS</Text>
      <View style={st.list}><View style={st.rowItem}><Text style={[st.rowTitle, { flex: 1 }]}>Temperature unit</Text><View style={st.segSm}>{['C', 'F'].map(u => (<TouchableOpacity key={u} style={[st.segBtnSm, unit === u && st.segBtnSmOn]} onPress={() => setUnit(u)}><Text style={[st.segTextSm, unit === u && st.segTextSmOn]}>°{u}</Text></TouchableOpacity>))}</View></View></View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function BottomNav({ active, onChange }) {
  const items = [{ key: 'live', label: 'Live', icon: '〰' }, { key: 'history', label: 'History', icon: '🕐' }, { key: 'device', label: 'Device', icon: 'ᛉ' }];
  return (
    <View style={st.navbar}>{items.map(it => (<TouchableOpacity key={it.key} style={st.navItem} onPress={() => onChange(it.key)}><View style={[st.navPill, active === it.key && st.navPillOn]}><Text style={{ fontSize: 18, color: C.ink2 }}>{it.icon}</Text></View><Text style={[st.navLabel, active === it.key && st.navLabelOn]}>{it.label}</Text></TouchableOpacity>))}</View>
  );
}

const rp = StyleSheet.create({ wrap: { position: 'absolute', width: 90, height: 90, alignItems: 'center', justifyContent: 'center' }, ring: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1.5, borderColor: '#2E8B57' } });
const sd = StyleSheet.create({ wrap: { width: 7, height: 7, alignItems: 'center', justifyContent: 'center' }, wave: { position: 'absolute', width: 7, height: 7, borderRadius: 4, borderWidth: 1.2, borderColor: '#2E8B57' }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2E8B57' } });

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 30 },
  appbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  appTitle: { fontSize: 20, fontWeight: '800', color: C.ink },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20, color: C.ink, fontWeight: '600' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: C.mint },
  chipDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.sea },
  chipText: { fontSize: 12, fontWeight: '700', color: C.seaDeep },
  stepsBars: { flexDirection: 'row', gap: 6, paddingHorizontal: 20 },
  stepBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: C.line },
  stepBarOn: { backgroundColor: C.sea },
  stepsLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  stepLbl: { fontSize: 10, fontWeight: '700', color: C.ink2, letterSpacing: 0.6 },
  stepLblOn: { color: C.sea },
  h1: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.6, marginTop: 22, marginBottom: 8 },
  h1sub: { fontSize: 14, color: C.ink2, lineHeight: 21, marginBottom: 20 },
  powerWrap: { alignItems: 'center', marginVertical: 20 },
  powerHalo: { width: 170, height: 170, borderRadius: 85, backgroundColor: '#E3F6EC', alignItems: 'center', justifyContent: 'center' },
  powerCore: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.sea, alignItems: 'center', justifyContent: 'center' },
  powerIcon: { fontSize: 44, color: '#fff' },
  list: { backgroundColor: C.card, borderRadius: 24, borderWidth: 1, borderColor: C.line, overflow: 'hidden', marginBottom: 16 },
  rowItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: C.ink },
  rowSub: { fontSize: 12, color: C.ink2, marginTop: 2 },
  chk: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.sea, alignItems: 'center', justifyContent: 'center' },
  chkTick: { color: '#fff', fontWeight: '900', fontSize: 12 },
  stReady: { fontSize: 13, fontWeight: '700', color: C.sea },
  stWait: { fontSize: 13, fontWeight: '600', color: C.ink2 },
  btnPrimary: { height: 48, borderRadius: 24, backgroundColor: C.sea, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  btnText: { height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  btnTextLabel: { color: C.sea, fontWeight: '700', fontSize: 13 },
  btnPrimarySm: { height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: C.sea, alignItems: 'center', justifyContent: 'center' },
  btnTonalSm: { height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  btnTonal: { flex: 1, height: 46, borderRadius: 23, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  btnTonalText: { color: C.seaDeep, fontWeight: '700', fontSize: 13 },
  radarWrap: { height: 232, alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  radarCore: { width: 104, height: 104, borderRadius: 52, backgroundColor: C.sea, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  radarIcon: { fontSize: 44, color: '#fff' },
  btBadge: { position: 'absolute', top: 6, right: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  btIcon: { color: C.sea, fontWeight: '900', fontSize: 14 },
  foundRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  foundLbl: { fontSize: 12, fontWeight: '800', color: C.ink2, letterSpacing: 0.6 },
  scanTxt: { fontSize: 12, fontWeight: '700', color: C.sea },
  spinCircle: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#D6F2E4', borderTopColor: '#2E8B57' },
  devCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, marginBottom: 10 },
  devThumb: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  devThumbIcon: { fontSize: 22, color: C.sea, fontWeight: '900' },
  devName: { fontSize: 14, fontWeight: '700', color: C.ink },
  devMeta: { fontSize: 11.5, color: C.ink2, fontWeight: '600' },
  calibWrap: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 30 },
  calibRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 14, borderColor: C.line },
  calibInner: { alignItems: 'center', justifyContent: 'center' },
  calibNumber: { fontSize: 56, fontWeight: '900', color: C.ink },
  calibLabel: { fontSize: 13, color: C.ink2, fontWeight: '700' },
  stage3d: { height: 260, borderRadius: 28, backgroundColor: '#E4EEEA', overflow: 'hidden', position: 'relative', marginBottom: 12 },
  ovTL: { position: 'absolute', top: 14, left: 16, zIndex: 10 },
  ovTLText: { fontSize: 11, fontWeight: '700', color: C.seaDeep },
  ovTR: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
  ovBL: { position: 'absolute', bottom: 13, left: 16, zIndex: 10 },
  ovBR: { position: 'absolute', bottom: 13, right: 16, fontSize: 11, color: C.ink2, fontWeight: '600', zIndex: 10 },
  pillDk: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 26, paddingHorizontal: 10, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.75)' },
  battMini: { width: 16, height: 10, borderWidth: 1.5, borderColor: C.seaDeep, borderRadius: 2, padding: 1 },
  battMiniFill: { height: '100%', backgroundColor: C.sea, borderRadius: 1 },
  battTxt: { fontSize: 11, fontWeight: '700', color: C.seaDeep },
  streamTxt: { fontSize: 11, fontWeight: '700', color: C.seaDeep },
  card: { backgroundColor: C.card, borderRadius: 24, padding: 14, borderWidth: 1, borderColor: C.line, gap: 8, marginBottom: 10 },
  gridRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  cardHalf: { flex: 1, backgroundColor: C.card, borderRadius: 24, padding: 14, borderWidth: 1, borderColor: C.line, gap: 6 },
  ch: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chIco: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  chTitle: { fontSize: 12, fontWeight: '700', color: C.ink2 },
  chAside: { marginLeft: 'auto', fontSize: 11, fontWeight: '600', color: C.ink2 },
  valRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  valNum: { fontSize: 36, fontWeight: '900', color: C.ink, letterSpacing: -1 },
  valUnit: { fontSize: 13, fontWeight: '700', color: C.ink2 },
  subText: { fontSize: 11.5, color: C.ink2, fontWeight: '600', marginTop: 4 },
  spoCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 5, borderColor: C.sea, alignItems: 'center', justifyContent: 'center' },
  unitSeg: { flexDirection: 'row', backgroundColor: '#E3EFE9', borderRadius: 14, padding: 2, gap: 2, alignSelf: 'flex-start', marginTop: 6 },
  unitSegBtn: { paddingHorizontal: 10, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  unitSegBtnOn: { backgroundColor: '#fff' },
  unitSegText: { fontSize: 10, fontWeight: '700', color: C.ink2 },
  unitSegTextOn: { color: C.seaDeep },
  biteBarsWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 30, marginTop: 6 },
  biteBar: { flex: 1, borderRadius: 2 },
  battShell: { width: 54, height: 26, borderRadius: 7, borderWidth: 2, borderColor: C.ink, padding: 2 },
  battFill: { height: '100%', borderRadius: 4, backgroundColor: C.sea },
  mvPill: { flexDirection: 'row', alignItems: 'center', height: 34, paddingHorizontal: 14, borderRadius: 17 },
  mvText: { fontWeight: '800', fontSize: 14 },
  axisRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  axisLbl: { fontSize: 10, fontWeight: '700', color: C.ink2, width: 12 },
  axisTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: C.line, position: 'relative', overflow: 'hidden' },
  axisFillLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: C.sea, borderRadius: 3 },
  disclaim: { fontSize: 10.5, color: C.ink2, textAlign: 'center', paddingHorizontal: 20, marginTop: 16, lineHeight: 15 },
  seg: { flexDirection: 'row', backgroundColor: '#E3EFE9', borderRadius: 20, padding: 3, gap: 2, marginBottom: 12 },
  segBtn: { flex: 1, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  segBtnOn: { backgroundColor: '#fff' },
  segText: { fontSize: 12.5, fontWeight: '700', color: C.ink2 },
  segTextOn: { color: C.seaDeep },
  segSm: { flexDirection: 'row', backgroundColor: '#E3EFE9', borderRadius: 14, padding: 2, gap: 2 },
  segBtnSm: { paddingHorizontal: 12, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  segBtnSmOn: { backgroundColor: '#fff' },
  segTextSm: { fontSize: 11, fontWeight: '700', color: C.ink2 },
  segTextSmOn: { color: C.seaDeep },
  miniRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  mini: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 20, padding: 12 },
  miniLabel: { fontSize: 11, fontWeight: '700', color: C.ink2 },
  miniValue: { fontSize: 22, fontWeight: '900', color: C.ink, letterSpacing: -0.5, marginTop: 4 },
  miniUnit: { fontSize: 11, fontWeight: '600', color: C.ink2, marginLeft: 3 },
  hcard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 24, padding: 14, marginTop: 10 },
  hBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 70, marginTop: 10 },
  hBar: { flex: 1, borderRadius: 2 },
  sect: { fontSize: 11, fontWeight: '800', color: C.ink2, letterSpacing: 0.8, marginTop: 20, marginBottom: 10 },
  sessionIco: { width: 34, height: 34, borderRadius: 11, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  devHero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 24, backgroundColor: C.seaDeep, marginTop: 4 },
  devHeroIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  devHeroTitle: { fontSize: 17, fontWeight: '800', color: '#E6FBF2' },
  devHeroSub: { fontSize: 12, color: 'rgba(230,251,242,0.75)', marginTop: 2 },
  stats3: { flexDirection: 'row', gap: 8, marginTop: 12 },
  stat3: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 18, padding: 10 },
  stat3Label: { fontSize: 10.5, fontWeight: '700', color: C.ink2 },
  stat3Value: { fontSize: 16, fontWeight: '900', color: C.ink, marginTop: 4 },
  actionIco: { width: 34, height: 34, borderRadius: 11, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  chev: { fontSize: 20, color: '#9DB5AB' },
  navbar: { flexDirection: 'row', backgroundColor: '#E6F1EC', paddingTop: 10, paddingBottom: 14 },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navPill: { width: 60, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  navPillOn: { backgroundColor: '#B7E4CC' },
  navLabel: { fontSize: 11, fontWeight: '700', color: C.ink2 },
  navLabelOn: { color: C.ink },
  sheetScrim: { flex: 1, backgroundColor: 'rgba(6,30,24,0.42)', justifyContent: 'flex-end' },
  sheetPanel: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 34 },
  grab: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#CFDDD6', alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 19, fontWeight: '800', color: C.ink, marginBottom: 6 },
  sheetText: { fontSize: 13.5, color: C.ink2, lineHeight: 20, marginBottom: 8 },
  sheetActs: { flexDirection: 'row', gap: 10, marginTop: 12 },
  toastBox: { position: 'absolute', left: 16, right: 16, bottom: 100, backgroundColor: '#10302A', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14 },
  toastText: { color: '#EAFFF4', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});

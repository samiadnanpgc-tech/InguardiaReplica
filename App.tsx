import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View,
  TouchableOpacity, Switch, Modal, Animated, Easing, Platform,
  Linking, PermissionsAndroid, Alert,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BleManager } from 'react-native-ble-plx';

const bleManager = new BleManager();

const C = {
  bg: '#F2F8F5', card: '#FFFFFF', sea: '#2E8B57', seaDeep: '#0F4C3A',
  seaInk: '#08352A', mint: '#D6F2E4', aqua: '#3CC8A0', ink: '#0E2A22',
  ink2: '#5B7A6F', line: '#E1EEE8', heart: '#E5484D', warn: '#E8A33D',
};

function base64ToBytes(base64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = [];
  let buffer = 0, bits = 0;
  for (let i = 0; i < base64.length; i++) {
    if (base64[i] === '=') break;
    const char = chars.indexOf(base64[i]);
    if (char === -1) continue;
    buffer = (buffer << 6) | char;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output.push((buffer >> bits) & 0xFF);
    }
  }
  return output;
}

function SpinningScan() {
  const rotate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(rotate, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })).start();
  }, [rotate]);
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.View style={[st.spinCircle, { transform: [{ rotate: spin }] }]} />;
}

function SignalBars({ strength }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 10 }}>
      {[4, 7, 10].map((h, i) => (
        <View key={i} style={{ width: 3, height: h, borderRadius: 1, backgroundColor: i < strength ? '#2E8B57' : '#CFE1D8' }} />
      ))}
    </View>
  );
}

function RadarPulse() {
  const r1 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(r1, { toValue: 1, duration: 3600, easing: Easing.bezier(0.2, 0.6, 0.3, 1), useNativeDriver: true }),
        Animated.timing(r1, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ).start();
  }, [r1]);
  const scale = r1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.5] });
  const opacity = r1.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.7, 0] });
  return <Animated.View style={[rp.ring, { opacity, transform: [{ scale }] }]} pointerEvents="none" />;
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
  return <Animated.Text style={{ fontSize: 12, color: C.heart, fontWeight: 'bold', transform: [{ scale }] }}>HR</Animated.Text>;
}

function SmoothECGWave({ hr }) {
  const VIEW_W = 190; const HEIGHT = 62; const BASELINE = HEIGHT / 2; const AMP = 22;
  const POINT_W = 1.2; const POINTS_PER_BEAT = 80; const CYCLE_W = POINTS_PER_BEAT * POINT_W;
  const BEATS = 4; const TOTAL_W = CYCLE_W * BEATS;
  const pathRef = useRef(''); const fillPathRef = useRef('');

  if (!pathRef.current) {
    let d = '';
    for (let b = 0; b < BEATS; b++) {
      for (let i = 0; i < POINTS_PER_BEAT; i++) {
        const p = i / POINTS_PER_BEAT;
        let v = 0;
        if (p >= 0.08 && p < 0.18) v = 0.18 * Math.sin(((p - 0.08) / 0.1) * Math.PI);
        else if (p >= 0.24 && p < 0.28) v = -0.16 * Math.sin(((p - 0.24) / 0.04) * Math.PI);
        else if (p >= 0.28 && p < 0.36) v = 1.0 * Math.sin(((p - 0.28) / 0.08) * Math.PI);
        else if (p >= 0.36 && p < 0.42) v = -0.32 * Math.sin(((p - 0.36) / 0.06) * Math.PI);
        else if (p >= 0.52 && p < 0.72) v = 0.26 * Math.sin(((p - 0.52) / 0.2) * Math.PI);
        v += (Math.random() - 0.5) * 0.015;
        const x = (b * POINTS_PER_BEAT + i) * POINT_W; const y = BASELINE - v * AMP;
        if (d === '') d = `M${x.toFixed(1)},${y.toFixed(1)}`; else d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
      }
    }
    pathRef.current = d; fillPathRef.current = `${d} L${TOTAL_W},${HEIGHT} L0,${HEIGHT} Z`;
  }

  const scrollX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    scrollX.setValue(0);
    const beatDuration = Math.max(500, (60 / (hr || 72)) * 1000);
    const anim = Animated.loop(Animated.timing(scrollX, { toValue: -CYCLE_W, duration: beatDuration, easing: Easing.linear, useNativeDriver: true }));
    anim.start(); return () => anim.stop();
  }, [hr, CYCLE_W, scrollX]);

  return (
    <View style={[wave.wrap, { width: VIEW_W, height: HEIGHT }]}>
      <View style={[wave.gridLine, { top: 0 }]} /><View style={[wave.gridLine, { top: HEIGHT * 0.33 }]} />
      <View style={[wave.gridLine, { top: HEIGHT * 0.66 }]} /><View style={[wave.gridLine, { top: HEIGHT - 1 }]} />
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, width: TOTAL_W, height: HEIGHT, transform: [{ translateX: scrollX }] }}>
        <Svg width={TOTAL_W} height={HEIGHT}>
          <Defs><LinearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={C.heart} stopOpacity="0.30" /><Stop offset="1" stopColor={C.heart} stopOpacity="0" /></LinearGradient></Defs>
          <Path d={fillPathRef.current} fill="url(#waveGrad)" />
          <Path d={pathRef.current} stroke={C.heart} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </Svg>
      </Animated.View>
      <View style={wave.liveDot} />
    </View>
  );
}

export default function App() {
  const [phase, setPhase] = useState('setup');
  const [screen, setScreen] = useState('live');
  const [toast, setToast] = useState('');
  const [liveData, setLiveData] = useState({ hr: 0, spo: 0, temp: 0, bites: 0, battery: 0, movement: 0 });
  const [debugText, setDebugText] = useState('Waiting for connection...');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      {phase === 'setup' && (
        <SetupFlow 
          onComplete={() => setPhase('app')} 
          onDataReceived={(d) => setLiveData(d)} 
          onDebug={setDebugText} 
        />
      )}
      {phase === 'app' && (
        <View style={{ flex: 1 }}>
          {screen === 'live' && <LiveScreen data={liveData} debugText={debugText} />}
          {screen === 'history' && <HistoryScreen />}
          {screen === 'device' && <DeviceScreen toast={showToast} />}
          <BottomNav active={screen} onChange={setScreen} />
        </View>
      )}
      {toast !== '' && <View style={st.toastBox} pointerEvents="none"><Text style={st.toastText}>{toast}</Text></View>}
    </SafeAreaView>
  );
}

function SetupFlow({ onComplete, onDataReceived, onDebug }) {
  const [step, setStep] = useState(2);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pairing, setPairing] = useState(false);
  const [connectingDeviceId, setConnectingDeviceId] = useState(null);
  const [foundDevices, setFoundDevices] = useState([]);
  const [bites, setBites] = useState(0);

  const openBluetoothSettings = () => {
    if (Platform.OS === 'android') Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS');
    setHelpOpen(false);
  };

  useEffect(() => {
    if (step === 2) {
      setPairing(true);
      setFoundDevices([]);
      
      const requestAndScan = async () => {
        if (Platform.OS === 'android' && Platform.Version >= 31) {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);
          if (granted['android.permission.BLUETOOTH_SCAN'] !== 'granted') {
            Alert.alert('Permission Denied', 'Bluetooth permissions required.'); return;
          }
        }
        startScan();
      };
      requestAndScan();
    }
    return () => bleManager.stopDeviceScan();
  }, [step]);

  const startScan = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) { console.log("SCAN ERROR:", error); setPairing(false); return; }
      if (device && (device.name || device.localName)) {
        setFoundDevices((prev) => {
          if (prev.find(d => d.id === device.id)) return prev;
          return [...prev, device];
        });
      }
    });
  };

  const connectToDevice = async (device) => {
    bleManager.stopDeviceScan();
    setPairing(false); 
    setConnectingDeviceId(device.id); 
    onDebug("Connecting to device...");
    
    try {
      const connectedDevice = await bleManager.connectToDevice(device.id, { timeout: 15000 });
      onDebug("Connected! Discovering services...");
      await connectedDevice.requestMTU(185);
      
      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      const services = await connectedDevice.services();
      let debugMsg = "SERVICES FOUND:\n";
      let targetService = null;
      let targetChar = null;

      for (let s of services) {
        debugMsg += `Svc: ${s.uuid}\n`;
        const chars = await connectedDevice.characteristicsForService(s.uuid);
        for (let c of chars) {
          debugMsg += `  Char: ${c.uuid} Notify:${c.isNotifiable}\n`;
          if (c.isNotifiable && !targetChar) {
            targetService = s.uuid;
            targetChar = c.uuid;
          }
        }
      }
      
      onDebug(debugMsg); 
      
      if (targetChar) {
        onDebug(`Monitoring: ${targetChar}`);
        bleManager.monitorCharacteristicForDevice(
          connectedDevice.id, targetService, targetChar, 
          (err, char) => {
            if (err) { 
              onDebug(`Monitor Err: ${err.message}`); 
              return; 
            }
            if (char?.value) {
              const bytes = base64ToBytes(char.value);
              onDebug(`RAW: [${bytes.join(', ')}]`);
              
              // --- ASLI DECODE LOGIC (Aapke data ke mutabiq) ---
              if (bytes.length >= 18) {
                const hr = bytes[8];
                const spo = bytes[9];
                const temp = (bytes[10] | (bytes[11] << 8)) / 100.0; // 57 + (14 * 256) = 3641 / 100 = 36.41
                const biteCount = bytes[12] | (bytes[13] << 8);       // 30 + (1 * 256) = 286
                const battery = bytes[16];
                const movement = bytes[17];
                
                onDataReceived({ hr, spo, temp, bites: biteCount, battery, movement });
              }
            }
          }
        );
      } else {
        onDebug("No Notifiable Characteristic found!");
      }

      setTimeout(() => { 
        setConnectingDeviceId(null); 
        setBites(0); 
        setStep(3); 
      }, 700);

    } catch (err) {
      onDebug(`Error: ${err.message}`);
      setConnectingDeviceId(null);
      Alert.alert('Connection Error', err.message); 
    }
  };

  useEffect(() => {
    if (step !== 3 || bites >= 3) return;
    const t = setTimeout(() => setBites(b => b + 1), 1200);
    return () => clearTimeout(t);
  }, [step, bites]);

  return (
    <View style={{ flex: 1 }}>
      <View style={st.appbar}>
        <TouchableOpacity style={st.iconBtn} onPress={() => { setStep(step - 1); setPairing(false); setConnectingDeviceId(null); bleManager.stopDeviceScan(); }}><Text style={st.iconText}>&lt;</Text></TouchableOpacity>
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

      {step === 2 && (
        <ScrollView contentContainerStyle={st.scroll}>
          <Text style={st.h1}>Pair your mouthpiece</Text>
          <Text style={st.h1sub}>Keep the green light breathing green and your phone within 1 m.</Text>
          <View style={st.radarWrap}><RadarPulse /><View style={st.radarCore}><Text style={st.radarIcon}>IG</Text><View style={st.btBadge}><Text style={st.btIcon}>BT</Text></View></View></View>
          
          <View style={st.foundRow}>
            <Text style={st.foundLbl}>NEARBY DEVICES</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {(pairing || connectingDeviceId) && <SpinningScan />}
              <Text style={st.scanTxt}>{pairing ? 'Scanning' : connectingDeviceId ? 'Connecting...' : 'Scan Stopped'}</Text>
            </View>
          </View>

          {foundDevices.length === 0 && pairing && (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#5B7A6F' }}>Dhoond rahe hain...</Text>
          )}
          
          {foundDevices.map((device, index) => (
            <View key={device.id || index} style={[st.devCard, { borderColor: device.name?.includes('Guardia') ? '#9FD8BC' : '#E1EEE8' }]}>
              <View style={st.devThumb}><Text style={st.devThumbIcon}>IG</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={st.devName}>{device.name || device.localName || 'Unknown Device'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Text style={st.devMeta}>{device.id.slice(-5)} ·</Text>
                  <SignalBars strength={device.rssi > -60 ? 3 : 1} />
                  <Text style={st.devMeta}>{device.rssi} dBm</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[st.btnPrimarySm, connectingDeviceId !== null && { opacity: 0.5 }]} 
                disabled={connectingDeviceId !== null}
                onPress={() => connectToDevice(device)}>
                <Text style={st.btnPrimaryText}>{connectingDeviceId === device.id ? 'Wait...' : 'Connect'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {step === 3 && (
        <ScrollView contentContainerStyle={st.scroll}>
          <Text style={st.h1}>{bites >= 3 ? 'Calibration complete' : 'Quick calibration'}</Text>
          <Text style={st.h1sub}>{bites >= 3 ? 'Baseline saved.' : 'Fit the mouthpiece and bite down gently 3 times.'}</Text>
          <View style={st.calibWrap}>
            <View style={[st.calibRing, { borderTopColor: bites >= 1 ? C.sea : C.line, borderRightColor: bites >= 2 ? C.sea : C.line, borderBottomColor: bites >= 3 ? C.sea : C.line, borderLeftColor: bites >= 3 ? C.sea : C.line }]} />
            <View style={st.calibInner}><Text style={st.calibNumber}>{bites}</Text><Text style={st.calibLabel}>of 3 bites</Text></View>
          </View>
          <TouchableOpacity style={[st.btnPrimary, bites < 3 && { backgroundColor: '#EEF1F0' }]} disabled={bites < 3} onPress={onComplete}><Text style={[st.btnPrimaryText, bites < 3 && { color: '#9AAAA4' }]}>Start monitoring</Text></TouchableOpacity>
          <TouchableOpacity style={st.btnText} onPress={onComplete}><Text style={st.btnTextLabel}>Skip for now</Text></TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={helpOpen} transparent animationType="slide">
        <View style={st.sheetScrim}><View style={st.sheetPanel}><View style={st.grab} /><Text style={st.sheetTitle}>Can't find your mouthpiece?</Text><Text style={st.sheetText}>1. Charge it for 10 mins.{'\n'}2. Hold green button for 3s.{'\n'}3. Stay within 1m.</Text><View style={st.sheetActs}><TouchableOpacity style={st.btnTonal} onPress={openBluetoothSettings}><Text style={st.btnTonalText}>Bluetooth settings</Text></TouchableOpacity><TouchableOpacity style={st.btnPrimarySm} onPress={() => setHelpOpen(false)}><Text style={st.btnPrimaryText}>Got it</Text></TouchableOpacity></View></View></View>
      </Modal>
    </View>
  );
}

function LiveScreen({ data, debugText }) {
  const { hr, spo, temp, bites, battery, movement } = data;
  return (
    <ScrollView contentContainerStyle={st.scroll}>
      <View style={st.appbar}><Text style={[st.appTitle, { flex: 1 }]}>Live monitor</Text><View style={st.chip}><View style={st.chipDot} /><Text style={st.chipText}>Real-time Data</Text></View><TouchableOpacity style={st.iconBtn}><Text style={st.iconText}>⋮</Text></TouchableOpacity></View>
      
      {/* DEBUG CONSOLE ON SCREEN */}
      <View style={{ backgroundColor: '#000', padding: 10, borderRadius: 10, marginBottom: 10 }}>
        <Text style={{ color: '#0f0', fontFamily: 'monospace', fontSize: 10 }}>
          {debugText}
        </Text>
      </View>

      <View style={st.stage3d}>
        <View style={st.ovTL}><Text style={st.ovTLText}>Connected <Text style={{ opacity: 0.6 }}>FW 2.4.1</Text></Text></View>
        <View style={st.ovTR}><View style={st.pillDk}><View style={st.battMini}><View style={[st.battMiniFill, { width: `${battery}%` }]} /></View><Text style={st.battTxt}>{battery}%</Text></View></View>
        <Device3D />
        <View style={st.ovBL}><View style={st.pillDk}><Text style={st.streamTxt}>Streaming · 1 Hz</Text></View></View>
      </View>

      <View style={st.card}>
        <View style={st.ch}><View style={[st.chIco, { backgroundColor: '#FDE7E8' }]}><PumpingHeart /></View><Text style={st.chTitle}>Heart rate</Text><Text style={st.chAside}>live</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View><View style={st.valRow}><Text style={st.valNum}>{hr}</Text><Text style={st.valUnit}>BPM</Text></View><Text style={st.subText}>Resting range · 58–84</Text></View>
          <SmoothECGWave hr={hr || 0} />
        </View>
      </View>

      <View style={st.gridRow}>
        <View style={st.cardHalf}>
          <View style={st.ch}><View style={[st.chIco, { backgroundColor: '#DDF0FB' }]}><Text style={{ fontSize: 14, color: '#2E86C1', fontWeight: 'bold' }}>O2</Text></View><Text style={st.chTitle}>SpO₂</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}><View style={st.spoCircle}><Text style={{ fontSize: 16, fontWeight: '900', color: C.ink }}>{spo}</Text></View><Text style={{ fontSize: 18, fontWeight: '700', color: C.ink2 }}>%</Text></View>
        </View>
        <View style={st.cardHalf}>
          <View style={st.ch}><View style={[st.chIco, { backgroundColor: '#FDEEE3' }]}><Text style={{ fontSize: 14, color: '#D2691E', fontWeight: 'bold' }}>T</Text></View><Text style={st.chTitle}>Temperature</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 }}><Text style={[st.valNum, { fontSize: 26 }]}>{temp ? temp.toFixed(1) : '0.0'}</Text><Text style={st.valUnit}>°C</Text></View>
        </View>
      </View>

      <View style={st.gridRow}>
        <View style={st.cardHalf}>
          <View style={st.ch}><View style={[st.chIco, { backgroundColor: C.mint }]}><Text style={{ fontSize: 14, color: C.sea, fontWeight: 'bold' }}>B</Text></View><Text style={st.chTitle}>Bite count</Text></View>
          <View style={st.valRow}><Text style={[st.valNum, { fontSize: 26 }]}>{bites}</Text><Text style={st.valUnit}>today</Text></View>
        </View>
        <View style={st.cardHalf}>
          <View style={st.ch}><View style={[st.chIco, { backgroundColor: '#E6F4EC' }]}><Text style={{ fontSize: 14, color: C.sea, fontWeight: 'bold' }}>%</Text></View><Text style={st.chTitle}>Battery</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}><View style={st.battShell}><View style={[st.battFill, { width: `${battery}%` }]} /></View><Text style={[st.valNum, { fontSize: 22, marginLeft: 8 }]}>{battery}%</Text></View>
        </View>
      </View>

      <View style={st.card}>
        <View style={st.ch}><View style={[st.chIco, { backgroundColor: '#FFF2DC' }]}><Text style={{ fontSize: 14, color: '#C07A12', fontWeight: 'bold' }}>M</Text></View><Text style={st.chTitle}>Movement</Text><Text style={st.chAside}>IMU · {movement}%</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6 }}>
          <View style={[st.mvPill, { backgroundColor: movement > 50 ? '#FFF2DC' : C.mint }]}><Text style={[st.mvText, { color: movement > 50 ? '#C07A12' : C.seaDeep }]}>● {movement > 50 ? 'Moving' : 'Still'}</Text></View>
        </View>
      </View>
      <Text style={st.disclaim}>Real-time data from hardware.</Text>
    </ScrollView>
  );
}

function Device3D() {
  const floatY = useRef(new Animated.Value(0)).current;
  const ledOpacity = useRef(new Animated.Value(1)).current;
  const rotZ = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([Animated.timing(floatY, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }), Animated.timing(floatY, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true })])).start();
    Animated.loop(Animated.sequence([Animated.timing(ledOpacity, { toValue: 0.3, duration: 700, useNativeDriver: true }), Animated.timing(ledOpacity, { toValue: 1, duration: 700, useNativeDriver: true })])).start();
    Animated.loop(Animated.timing(rotZ, { toValue: 1, duration: 25000, easing: Easing.linear, useNativeDriver: true })).start();
  }, [floatY, ledOpacity, rotZ]);

  const translateY = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const rotateDeg = rotZ.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: ['-8deg', '82deg', '172deg', '262deg', '352deg'] });

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', bottom: 30, width: 160, height: 18, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.18)' }} />
      <Animated.View style={{ width: 140, height: 100, backgroundColor: '#fff', borderRadius: 30, transform: [{ translateY }, { rotateZ: rotateDeg }], alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}>
         <Text style={{ fontSize: 30, color: C.sea, fontWeight: 'bold' }}>IG</Text>
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
      <View style={st.list}>{[{ t: 'Last night', sub: '23:10 – 06:52 · 7 h 42 m · 212 bites', ok: true }, { t: 'Mon 21 Sep', sub: '23:40 – 07:05 · 7 h 25 m · 188 bites', ok: true }, { t: 'Sun 20 Sep', sub: '00:15 – 06:30 · 6 h 15 m · 341 bites', ok: false }].map((it, i) => (<View key={i} style={st.rowItem}><View style={st.sessionIco}><Text style={{ fontSize: 12, fontWeight: 'bold' }}>N</Text></View><View style={{ flex: 1 }}><Text style={st.rowTitle}>{it.t}</Text><Text style={st.rowSub}>{it.sub}</Text></View><Text style={[st.stReady, !it.ok && { color: '#C07A12' }]}>{it.ok ? 'Normal' : 'High bites'}</Text></View>))}</View>
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
      <View style={st.devHero}><View style={st.devHeroIcon}><Text style={{ fontSize: 20, color: '#fff', fontWeight: 'bold' }}>IG</Text></View><View style={{ flex: 1 }}><Text style={st.devHeroTitle}>Connected Board</Text><Text style={st.devHeroSub}>Hardware Connection</Text><Text style={st.devHeroSub}>Active · −48 dBm</Text></View></View>
      <View style={st.stats3}><View style={st.stat3}><Text style={st.stat3Label}>Battery</Text><Text style={st.stat3Value}>82%</Text></View><View style={st.stat3}><Text style={st.stat3Label}>Firmware</Text><Text style={st.stat3Value}>2.4.1</Text></View><View style={st.stat3}><Text style={st.stat3Label}>Storage</Text><Text style={st.stat3Value}>64%</Text></View></View>
      <Text style={st.sect}>ACTIONS</Text>
      <View style={st.list}>
        <TouchableOpacity style={st.rowItem} onPress={() => toast('Ring light is blinking')}><View style={st.actionIco}><Text style={{ fontSize: 12, fontWeight: 'bold' }}>Fin</Text></View><View style={{ flex: 1 }}><Text style={st.rowTitle}>Find my device</Text><Text style={st.rowSub}>Blinks the green light for 5 s</Text></View><Text style={st.chev}>&gt;</Text></TouchableOpacity>
        <TouchableOpacity style={st.rowItem} onPress={() => toast('Recalibrating…')}><View style={st.actionIco}><Text style={{ fontSize: 12, fontWeight: 'bold' }}>Cal</Text></View><View style={{ flex: 1 }}><Text style={st.rowTitle}>Recalibrate sensors</Text><Text style={st.rowSub}>Last calibrated today, 9:41</Text></View><Text style={st.chev}>&gt;</Text></TouchableOpacity>
      </View>
      <Text style={st.sect}>SETTINGS</Text>
      <View style={st.list}>
        <View style={st.rowItem}><View style={{ flex: 1 }}><Text style={st.rowTitle}>Live streaming</Text><Text style={st.rowSub}>Send readings to this phone in real time</Text></View><Switch value={live} onValueChange={setLive} trackColor={{ false: '#C9D8D1', true: C.sea }} thumbColor="#fff" /></View>
        <View style={st.rowItem}><View style={{ flex: 1 }}><Text style={st.rowTitle}>Clench alert vibration</Text><Text style={st.rowSub}>Buzz gently after 5 hard bites in a row</Text></View><Switch value={clench} onValueChange={setClench} trackColor={{ false: '#C9D8D1', true: C.sea }} thumbColor="#fff" /></View>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function BottomNav({ active, onChange }) {
  const items = [{ key: 'live', label: 'Live', icon: '~' }, { key: 'history', label: 'History', icon: 'H' }, { key: 'device', label: 'Device', icon: 'D' }];
  return (
    <View style={st.navbar}>{items.map(it => (<TouchableOpacity key={it.key} style={st.navItem} onPress={() => onChange(it.key)}><View style={[st.navPill, active === it.key && st.navPillOn]}><Text style={{ fontSize: 16, fontWeight: 'bold', color: C.ink2 }}>{it.icon}</Text></View><Text style={[st.navLabel, active === it.key && st.navLabelOn]}>{it.label}</Text></TouchableOpacity>))}</View>
  );
}

const rp = StyleSheet.create({ ring: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1.5, borderColor: '#2E8B57' } });
const wave = StyleSheet.create({ wrap: { position: 'relative', overflow: 'hidden', marginLeft: 8 }, gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#F0F4F2' }, liveDot: { position: 'absolute', right: -3, top: 62 / 2 - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: C.heart, shadowColor: C.heart, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4 } });

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
  radarWrap: { height: 232, alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  radarCore: { width: 104, height: 104, borderRadius: 52, backgroundColor: C.sea, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  radarIcon: { fontSize: 30, color: '#fff', fontWeight: 'bold' },
  btBadge: { position: 'absolute', top: 6, right: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  btIcon: { color: C.sea, fontWeight: '900', fontSize: 12 },
  foundRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  foundLbl: { fontSize: 12, fontWeight: '800', color: C.ink2, letterSpacing: 0.6 },
  scanTxt: { fontSize: 12, fontWeight: '700', color: C.sea },
  spinCircle: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#D6F2E4', borderTopColor: '#2E8B57' },
  devCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, marginBottom: 10 },
  devThumb: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  devThumbIcon: { fontSize: 18, color: C.sea, fontWeight: '900' },
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
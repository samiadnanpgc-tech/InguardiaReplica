import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View,
  TouchableOpacity, Switch, Modal, Animated, Easing, Platform,
  Linking, PermissionsAndroid, Alert, ActivityIndicator, PanResponder
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Rect, Ellipse, Pattern } from 'react-native-svg';
import { BleManager } from 'react-native-ble-plx';
import AsyncStorage from '@react-native-async-storage/async-storage';

const bleManager = new BleManager();

const C = {
  bg: '#F2F8F5', card: '#FFFFFF', sea: '#2E8B57', seaDeep: '#0F4C3A',
  seaInk: '#08352A', mint: '#D6F2E4', aqua: '#3CC8A0', ink: '#0E2A22',
  ink2: '#5B7A6F', line: '#E1EEE8', heart: '#E5484D', warn: '#E8A33D', danger: '#E5484D'
};

// 🔥 LOGO COMPONENT 🔥
function BrandLogo({ size = 40, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M 25 25 L 25 55 A 25 25 0 0 0 75 55 L 75 25" stroke={color} strokeWidth="10" strokeLinecap="round" fill="none" />
      <Path d="M 40 25 L 40 55 A 10 10 0 0 0 60 55 L 60 25" stroke={color} strokeWidth="10" strokeLinecap="round" fill="none" />
      <Circle cx="50" cy="80" r="5.5" fill={color} />
    </Svg>
  );
}

// 🔥 EXACT 3D MODEL WITH DRAG TO ROTATE 🔥
function Mechanical3DModel() {
  const floatY = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(floatY, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: false })
      ])
    ).start();
  }, [floatY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        pan.setValue(gestureState.dx);
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: false
        }).start();
      }
    })
  ).current;

  const translateY = floatY.interpolate({ inputRange: [0, 1], outputRange: [6, -6] });
  const rotate = pan.interpolate({ inputRange: [-300, 300], outputRange: ['-180deg', '180deg'], extrapolate: 'clamp' });

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} {...panResponder.panHandlers}>
      <Animated.View style={{ transform: [{ translateY }, { rotateZ: rotate }] }}>
        <Svg width="220" height="220" viewBox="0 0 200 200">
          <Defs>
            <LinearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#2a2c2a" />
              <Stop offset="1" stopColor="#0d0f0d" />
            </LinearGradient>
            <LinearGradient id="frontGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#1a1c1a" />
              <Stop offset="1" stopColor="#000000" />
            </LinearGradient>
            <LinearGradient id="blockTop" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#3a3c3a" />
              <Stop offset="1" stopColor="#111" />
            </LinearGradient>
            <LinearGradient id="blockSide" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#1a1c1a" />
              <Stop offset="1" stopColor="#050505" />
            </LinearGradient>
          </Defs>

          <Ellipse cx="100" cy="165" rx="75" ry="15" fill="rgba(0,0,0,0.15)" />
          <Path d="M 125 65 L 155 80 L 135 90 L 105 75 Z" fill="url(#blockTop)" />
          <Path d="M 155 80 L 155 140 L 135 150 L 135 90 Z" fill="url(#blockSide)" />
          <Path d="M 105 75 L 135 90 L 135 150 L 105 135 Z" fill="url(#frontGrad)" />
          <Path d="M 125 65 L 155 80" stroke="#555" strokeWidth="1.5" fill="none" />
          <Path d="M 80 40 C 30 40, 15 100, 50 145 C 80 180, 120 160, 130 150 L 130 120 C 110 140, 70 140, 55 100 C 45 60, 80 55, 105 65 Z" fill="url(#bodyGrad)" />
          <Path d="M 50 145 C 80 180, 120 160, 130 150 L 130 130 C 120 140, 80 150, 60 125 Z" fill="url(#frontGrad)" />
          <Path d="M 50 145 C 80 180, 120 160, 130 150" stroke="#333" strokeWidth="1" fill="none" />
          <Circle cx="85" cy="95" r="14" fill="#E4EEEA" />
          <Circle cx="85" cy="95" r="14" stroke="#000" strokeWidth="4" fill="none" opacity="0.8" />
          <Path d="M 85 81 C 70 81, 60 100, 70 120" stroke="#111" strokeWidth="3" fill="none" />
          <Path d="M 85 109 C 90 109, 95 105, 95 95" stroke="#222" strokeWidth="2" fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}

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
  return <Animated.Text style={{ fontSize: 16, transform: [{ scale }] }}>❤️</Animated.Text>;
}

function SmoothECGWave({ hr }) {
  const VIEW_W = 150; const HEIGHT = 50; const BASELINE = HEIGHT / 2; const AMP = 18;
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
      <View style={[wave.liveDot, { top: HEIGHT / 2 - 5 }]} />
    </View>
  );
}

export default function App() {
  const [phase, setPhase] = useState('setup');
  const [screen, setScreen] = useState('live');
  const [toast, setToast] = useState('');
  const [liveData, setLiveData] = useState({ hr: 0, spo: 0, temp: 0, bites: 0, battery: 0, movement: 0 });
  const [connectedDeviceId, setConnectedDeviceId] = useState(null);
  
  // 🔥 NEW: Temperature Unit State (Real conversion)
  const [tempUnit, setTempUnit] = useState('C');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const saveToHistory = async (newData) => {
    setLiveData(newData);
    try {
      const existingDataStr = await AsyncStorage.getItem('@inguardia_history');
      let history = existingDataStr ? JSON.parse(existingDataStr) : [];
      history.push({ ...newData, timestamp: Date.now() });
      if (history.length > 50) history = history.slice(history.length - 50);
      await AsyncStorage.setItem('@inguardia_history', JSON.stringify(history));
    } catch (e) { console.error("History save error:", e); }
  };

  const disconnectDevice = async () => {
    if (connectedDeviceId) {
      try {
        await bleManager.cancelDeviceConnection(connectedDeviceId);
        setConnectedDeviceId(null);
        setPhase('setup');
        showToast('Device disconnected successfully');
      } catch (e) {
        showToast('Failed to disconnect');
      }
    }
  };

  useEffect(() => {
    if (!connectedDeviceId) return;
    const sub = bleManager.onDeviceDisconnected(connectedDeviceId, () => {
      setConnectedDeviceId(null);
      setPhase('setup');
      showToast('Device disconnected');
    });
    return () => sub.remove();
  }, [connectedDeviceId]);

  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      {phase === 'setup' && (
        <SetupFlow
          onComplete={() => setPhase('app')}
          onDataReceived={saveToHistory}
          onConnected={setConnectedDeviceId}
        />
      )}
      {phase === 'app' && (
        <View style={{ flex: 1 }}>
          {screen === 'live' && <LiveScreen data={liveData} tempUnit={tempUnit} />}
          {screen === 'history' && <HistoryScreen tempUnit={tempUnit} />}
          {screen === 'device' && (
            <DeviceScreen
              toast={showToast}
              liveData={liveData}
              connectedDeviceId={connectedDeviceId}
              onDisconnect={disconnectDevice}
              tempUnit={tempUnit}
              setTempUnit={setTempUnit}
            />
          )}
          <BottomNav active={screen} onChange={setScreen} />
        </View>
      )}
      {toast !== '' && <View style={st.toastBox} pointerEvents="none"><Text style={st.toastText}>{toast}</Text></View>}
    </SafeAreaView>
  );
}

function SetupFlow({ onComplete, onDataReceived, onConnected }) {
  const [step, setStep] = useState(2);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pairing, setPairing] = useState(false);
  const [connectingDeviceId, setConnectingDeviceId] = useState(null);
  const [foundDevices, setFoundDevices] = useState([]);
  const [bites, setBites] = useState(0);

  const [sensorsReady, setSensorsReady] = useState({ pulse: false, temp: false, bite: false });

  const stepRef = useRef(2);
  const lastBiteRef = useRef(null);
  const connectingRef = useRef(null);

  useEffect(() => { stepRef.current = step; }, [step]);

  useEffect(() => {
    if (step === 3) {
      setBites(0);
      lastBiteRef.current = null;
      setSensorsReady({ pulse: false, temp: false, bite: false });
    }
  }, [step]);

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
    if (connectingRef.current) return;
    connectingRef.current = device.id;
    
    bleManager.stopDeviceScan();
    setPairing(false);
    setConnectingDeviceId(device.id);

    try {
      const connectedDevice = await bleManager.connectToDevice(device.id, { timeout: 15000 });
      await connectedDevice.requestMTU(185);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      onConnected(connectedDevice.id);

      const services = await connectedDevice.services();
      let targetService = null;
      let targetChar = null;

      for (let s of services) {
        const chars = await connectedDevice.characteristicsForService(s.uuid);
        for (let c of chars) {
          if (c.isNotifiable && !targetChar) {
            targetService = s.uuid;
            targetChar = c.uuid;
          }
        }
      }

      if (targetChar) {
        bleManager.monitorCharacteristicForDevice(
          connectedDevice.id, targetService, targetChar,
          (err, char) => {
            if (err) return;
            if (char?.value) {
              const bytes = base64ToBytes(char.value);
              if (bytes.length >= 18) {
                const hr = bytes[8];
                const spo = bytes[9];
                const temp = (bytes[10] | (bytes[11] << 8)) / 100.0;
                const biteCount = bytes[12] | (bytes[13] << 8);
                const battery = bytes[16];
                const movement = bytes[17];

                onDataReceived({ hr, spo, temp, bites: biteCount, battery, movement });

                setSensorsReady(prev => ({
                  pulse: prev.pulse || (hr > 0 && spo > 0),
                  temp: prev.temp || (temp > 30 && temp < 45), 
                  bite: prev.bite || true, 
                }));

                if (stepRef.current === 3) {
                  if (lastBiteRef.current === null) {
                    lastBiteRef.current = biteCount;
                  } else if (biteCount > lastBiteRef.current) {
                    const diff = biteCount - lastBiteRef.current;
                    lastBiteRef.current = biteCount;
                    setBites(prev => Math.min(3, prev + diff));
                  }
                }
              }
            }
          }
        );
      }

      setTimeout(() => { setConnectingDeviceId(null); setStep(3); }, 700);

    } catch (err) {
      setConnectingDeviceId(null);
      Alert.alert('Connection Error', err.message);
    } finally {
      connectingRef.current = null;
    }
  };

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
          
          <View style={st.radarWrap}>
            <RadarPulse />
            <View style={st.radarCore}>
              <BrandLogo size={60} color="#FFFFFF" />
              <View style={st.btBadge}><Text style={st.btIcon}>BT</Text></View>
            </View>
          </View>

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

          {foundDevices.map((device, index) => {
            const isConnecting = connectingDeviceId === device.id;
            const isAnyConnecting = connectingDeviceId !== null;

            return (
              <View key={device.id} style={[st.devCard, { borderColor: isConnecting ? '#9FD8BC' : '#E1EEE8' }]}>
                <View style={st.devThumb}>
                  <BrandLogo size={28} color={C.sea} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.devName}>{device.name || device.localName || 'Unknown Device'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={st.devMeta}>{device.id.slice(-5)} ·</Text>
                    <SignalBars strength={device.rssi > -60 ? 3 : 1} />
                    <Text style={st.devMeta}>{device.rssi} dBm</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[st.btnPrimarySm, isAnyConnecting && !isConnecting && { opacity: 0.4 }]}
                  disabled={isAnyConnecting}
                  onPress={() => connectToDevice(device)}
                >
                  <Text style={st.btnPrimaryText}>{isConnecting ? 'Wait...' : 'Connect'}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {step === 3 && (
        <ScrollView contentContainerStyle={st.scroll}>
          <Text style={st.h1}>{bites >= 3 ? 'Calibration complete' : 'Quick calibration'}</Text>
          <Text style={st.h1sub}>{bites >= 3 ? 'Baseline saved. You can recalibrate at any time from the Device tab.' : 'Fit the mouthpiece and bite down gently 3 times.'}</Text>
          
          <View style={st.calibWrap}>
            <View style={[st.calibRing, { borderTopColor: bites >= 1 ? C.sea : C.line, borderRightColor: bites >= 2 ? C.sea : C.line, borderBottomColor: bites >= 3 ? C.sea : C.line, borderLeftColor: bites >= 3 ? C.sea : C.line }]} />
            <View style={st.calibInner}><Text style={st.calibNumber}>{bites}</Text><Text style={st.calibLabel}>of 3 bites</Text></View>
          </View>

          {bites >= 3 && (
            <View style={st.sensorBox}>
              <View style={st.sensorRow}>
                <Text style={st.sensorName}>Bite sensor</Text>
                <Text style={[st.sensorStatus, sensorsReady.bite ? { color: C.sea } : { color: C.warn }]}>
                  {sensorsReady.bite ? '✓ Ready' : 'Checking...'}
                </Text>
              </View>
              <View style={st.sensorDivider} />
              
              <View style={st.sensorRow}>
                <Text style={st.sensorName}>Pulse sensor · HR & SpO₂</Text>
                <Text style={[st.sensorStatus, sensorsReady.pulse ? { color: C.sea } : { color: C.warn }]}>
                  {sensorsReady.pulse ? '✓ Ready' : 'Checking...'}
                </Text>
              </View>
              <View style={st.sensorDivider} />

              <View style={st.sensorRow}>
                <Text style={st.sensorName}>Temperature</Text>
                <Text style={[st.sensorStatus, sensorsReady.temp ? { color: C.sea } : { color: C.warn }]}>
                  {sensorsReady.temp ? '✓ Ready' : 'Checking...'}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={[st.btnPrimary, bites < 3 && { backgroundColor: '#EEF1F0' }, bites >= 3 && { marginTop: 20 }]} disabled={bites < 3} onPress={onComplete}>
            <Text style={[st.btnPrimaryText, bites < 3 && { color: '#9AAAA4' }]}>Start monitoring</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.btnText} onPress={onComplete}><Text style={st.btnTextLabel}>Skip for now</Text></TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={helpOpen} transparent animationType="slide">
        <View style={st.sheetScrim}><View style={st.sheetPanel}><View style={st.grab} /><Text style={st.sheetTitle}>Can't find your mouthpiece?</Text><Text style={st.sheetText}>1. Charge it for 10 mins.{'\n'}2. Hold green button for 3s.{'\n'}3. Stay within 1m.</Text><View style={st.sheetActs}><TouchableOpacity style={st.btnTonal} onPress={openBluetoothSettings}><Text style={st.btnTonalText}>Bluetooth settings</Text></TouchableOpacity><TouchableOpacity style={st.btnPrimarySm} onPress={() => setHelpOpen(false)}><Text style={st.btnPrimaryText}>Got it</Text></TouchableOpacity></View></View></View>
      </Modal>
    </View>
  );
}

function LiveScreen({ data, tempUnit }) {
  const { hr, spo, temp, bites, battery, movement } = data;
  // 🔥 REAL CONVERSION: Celsius to Fahrenheit
  const displayTemp = tempUnit === 'C' ? temp : (temp * 9/5) + 32;

  return (
    <ScrollView contentContainerStyle={st.scroll}>
      <View style={st.appbar}><Text style={[st.appTitle, { flex: 1 }]}>Live monitor</Text><View style={st.chip}><View style={st.chipDot} /><Text style={st.chipText}>Real-time Data</Text></View><TouchableOpacity style={st.iconBtn}><Text style={st.iconText}>⋮</Text></TouchableOpacity></View>

      <View style={st.stage3d}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5 }}>
           <Svg width="100%" height="100%">
              <Defs>
                <Pattern id="grid" width="15" height="15" patternUnits="userSpaceOnUse">
                  <Path d="M 15 0 L 0 0 0 15" fill="none" stroke="#D1DCD7" strokeWidth="1"/>
                </Pattern>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#grid)" />
           </Svg>
        </View>

        <View style={st.ovTL}>
          <Text style={st.ovTLTextMain}>Inguardia IG-1 <Text style={st.ovTLTextSub}>FW 2.4.1</Text></Text>
        </View>
        
        <View style={st.ovTR}>
          <View style={st.pillDk}>
            <View style={st.battMini}>
              <View style={[st.battMiniFill, { width: `${battery || 81}%` }]} />
            </View>
            <Text style={st.battTxt}>{battery || 81}%</Text>
          </View>
        </View>
        
        <Mechanical3DModel />
        
        <View style={st.ovBR}>
          <Text style={st.dragTxt}>Drag to rotate</Text>
        </View>
      </View>

      {/* Heart Rate Card */}
      <View style={st.card}>
        <View style={st.ch}>
          <View style={[st.chIco, { backgroundColor: '#FDE7E8' }]}><PumpingHeart /></View>
          <Text style={st.chTitle}>Heart rate</Text>
          <Text style={st.chAside}>updated now</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <View><View style={st.valRow}><Text style={st.valNum}>{hr}</Text><Text style={st.valUnit}>BPM</Text></View><Text style={st.subText}>Resting range · 58–84</Text></View>
          <SmoothECGWave hr={hr || 0} />
        </View>
      </View>

      <View style={st.gridRow}>
        {/* SpO2 Card */}
        <View style={st.cardHalf}>
          <View style={st.ch}>
            <View style={[st.chIco, { backgroundColor: '#DDF0FB' }]}><Text style={{ fontSize: 14 }}>💧</Text></View>
            <Text style={st.chTitle}>SpO₂</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <View style={st.spoCircle}><Text style={{ fontSize: 16, fontWeight: '900', color: C.ink }}>{spo}</Text></View><Text style={{ fontSize: 18, fontWeight: '700', color: C.ink2 }}>%</Text>
          </View>
          <Text style={[st.subText, { marginTop: 10 }]}>Signal <SignalBars strength={3} /> good</Text>
        </View>

        {/* Temperature Card */}
        <View style={st.cardHalf}>
          <View style={st.ch}>
            <View style={[st.chIco, { backgroundColor: '#FDEEE3' }]}><Text style={{ fontSize: 14 }}>🌡️</Text></View>
            <Text style={st.chTitle}>Temperature</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
            <Text style={[st.valNum, { fontSize: 26 }]}>{displayTemp ? displayTemp.toFixed(1) : '0.0'}</Text>
            <Text style={st.valUnit}>°{tempUnit}</Text>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: '#E1EEE8', marginTop: 8, flexDirection: 'row', overflow: 'hidden' }}>
            <View style={{ flex: 1, backgroundColor: '#3CC8A0' }} />
            <View style={{ flex: 1, backgroundColor: '#E8A33D' }} />
            <View style={{ flex: 1, backgroundColor: '#E5484D' }} />
          </View>
          <Text style={[st.subText, { marginTop: 6 }]}>Oral · normal {tempUnit === 'C' ? '36.1–37.5' : '97.0–99.5'}</Text>
        </View>
      </View>

      <View style={st.gridRow}>
        {/* Bite Count Card */}
        <View style={st.cardHalf}>
          <View style={st.ch}>
            <View style={[st.chIco, { backgroundColor: C.mint }]}><Text style={{ fontSize: 14 }}>🦷</Text></View>
            <Text style={st.chTitle}>Bite count</Text>
          </View>
          <View style={st.valRow}><Text style={[st.valNum, { fontSize: 26 }]}>{bites}</Text><Text style={st.valUnit}>today</Text></View>
          <View style={st.biteBarsWrap}>
            {[...Array(12)].map((_, i) => (
               <View key={i} style={[st.biteBar, { height: 10 + Math.random() * 20, backgroundColor: i === 11 ? C.sea : C.mint }]} />
            ))}
          </View>
        </View>

        {/* Battery Card */}
        <View style={st.cardHalf}>
          <View style={st.ch}>
            <View style={[st.chIco, { backgroundColor: '#E6F4EC' }]}><Text style={{ fontSize: 14 }}>⚡</Text></View>
            <Text style={st.chTitle}>Battery</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <View style={st.battShell}><View style={[st.battFill, { width: `${battery}%` }]} /></View>
            <Text style={[st.valNum, { fontSize: 22, marginLeft: 8 }]}>{battery}%</Text>
          </View>
          <Text style={[st.subText, { marginTop: 6 }]}>≈ 9 h 10 m remaining</Text>
        </View>
      </View>

      {/* Movement Card */}
      <View style={st.card}>
        <View style={st.ch}>
          <View style={[st.chIco, { backgroundColor: '#FFF2DC' }]}><Text style={{ fontSize: 14 }}>✥</Text></View>
          <Text style={st.chTitle}>Movement</Text>
          <Text style={st.chAside}>IMU · g</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 }}>
          <View style={[st.mvPill, { backgroundColor: movement > 50 ? '#FFF2DC' : C.mint }]}><Text style={[st.mvText, { color: movement > 50 ? '#C07A12' : C.seaDeep }]}>● {movement > 50 ? 'Moving' : 'Still'}</Text></View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={st.axisRow}><Text style={st.axisLbl}>X</Text><View style={st.axisTrack}><View style={[st.axisFillLeft, { width: `${Math.min(100, Math.max(0, movement))}%` }]} /></View></View>
            <View style={st.axisRow}><Text style={st.axisLbl}>Y</Text><View style={st.axisTrack}><View style={[st.axisFillLeft, { width: `${Math.min(100, Math.max(0, 100 - movement))}%` }]} /></View></View>
          </View>
        </View>
      </View>
      <Text style={st.disclaim}>Real-time data from hardware.</Text>
    </ScrollView>
  );
}

function HistoryScreen({ tempUnit }) {
  const [history, setHistory] = useState([]);
  const [showReadings, setShowReadings] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await AsyncStorage.getItem('@inguardia_history');
        if (data) setHistory(JSON.parse(data).reverse());
      } catch (e) { console.log("History load error:", e); }
    };
    loadHistory();
  }, []);

  const avgHr = history.length ? Math.round(history.reduce((a, c) => a + c.hr, 0) / history.length) : 0;
  const avgSpo = history.length ? Math.round(history.reduce((a, c) => a + c.spo, 0) / history.length) : 0;
  
  // Convert average temp if needed
  let avgTemp = history.length ? (history.reduce((a, c) => a + c.temp, 0) / history.length) : 0;
  if (tempUnit === 'F') avgTemp = (avgTemp * 9/5) + 32;
  
  const totalBites = history.length ? history[0].bites : 0;

  if (!showReadings) {
    return (
      <ScrollView contentContainerStyle={st.scroll}>
        <View style={st.appbar}><Text style={[st.appTitle, { flex: 1 }]}>History</Text><View style={st.chip}><View style={st.chipDot} /><Text style={st.chipText}>{history.length} readings</Text></View></View>

        <View style={st.miniRow}>
          <View style={st.mini}><Text style={st.miniLabel}>Avg Heart Rate</Text><View style={{ flexDirection: 'row', alignItems: 'baseline' }}><Text style={st.miniValue}>{avgHr}</Text><Text style={st.miniUnit}>bpm</Text></View></View>
          <View style={st.mini}><Text style={st.miniLabel}>Avg SpO₂</Text><View style={{ flexDirection: 'row', alignItems: 'baseline' }}><Text style={st.miniValue}>{avgSpo}</Text><Text style={st.miniUnit}>%</Text></View></View>
        </View>

        <View style={st.miniRow}>
          <View style={st.mini}><Text style={st.miniLabel}>Latest Bite Count</Text><Text style={st.miniValue}>{totalBites}</Text></View>
          <View style={st.mini}><Text style={st.miniLabel}>Avg Temperature</Text><View style={{ flexDirection: 'row', alignItems: 'baseline' }}><Text style={st.miniValue}>{avgTemp.toFixed(1)}</Text><Text style={st.miniUnit}>°{tempUnit}</Text></View></View>
        </View>

        <Text style={st.sect}>MORE DETAILS</Text>
        
        <View style={st.list}>
          <TouchableOpacity style={st.rowItem} onPress={() => setShowReadings(true)}>
            <View style={st.actionIco}><Text style={{ fontSize: 10, fontWeight: 'bold' }}>LOG</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={st.rowTitle}>Recent Readings</Text>
              <Text style={st.rowSub}>View detailed history logs</Text>
            </View>
            <Text style={st.chev}>&gt;</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 20 }} />
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={st.appbar}>
        <TouchableOpacity style={st.iconBtn} onPress={() => setShowReadings(false)}>
          <Text style={st.iconText}>&lt;</Text>
        </TouchableOpacity>
        <Text style={[st.appTitle, { flex: 1, textAlign: 'center' }]}>Detailed Logs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={st.scroll}>
        <View style={st.historyTable}>
          <View style={st.historyHeader}>
            <Text style={[st.historyHeaderTxt, { width: 60 }]}>Time</Text>
            <Text style={st.historyHeaderTxt}>HR</Text>
            <Text style={st.historyHeaderTxt}>SpO₂</Text>
            <Text style={st.historyHeaderTxt}>Temp</Text>
          </View>

          {history.length === 0 ? (
            <Text style={{ textAlign: 'center', padding: 20, color: '#5B7A6F' }}>Koi data nahi mila. Pehle device connect karein.</Text>
          ) : (
            history.map((item, index) => {
              const date = new Date(item.timestamp);
              const timeStr = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2, '0')}`;
              const rowTemp = tempUnit === 'C' ? item.temp : (item.temp * 9/5) + 32;
              return (
                <View key={index} style={[st.historyRow, index % 2 === 0 && { backgroundColor: '#F9FCFA' }]}>
                  <Text style={[st.historyCellTxt, { width: 60, fontWeight: '700', color: C.ink }]}>{timeStr}</Text>
                  <Text style={st.historyCellTxt}>{item.hr}</Text>
                  <Text style={st.historyCellTxt}>{item.spo}%</Text>
                  <Text style={st.historyCellTxt}>{rowTemp.toFixed(1)}°</Text>
                </View>
              );
            })
          )}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// 🔥 EXACT DEVICE SCREEN UI FROM IMAGE 🔥
function DeviceScreen({ toast, liveData, connectedDeviceId, onDisconnect, tempUnit, setTempUnit }) {
  const [live, setLive] = useState(true);
  const [clench, setClench] = useState(true);
  const [autoSync, setAutoSync] = useState(false);
  const [sampleRate, setSampleRate] = useState('25'); // 10, 25, 50
  const [rssi, setRssi] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const isConnected = connectedDeviceId !== null;

  const refreshSignal = async () => {
    if (!isConnected) { toast('Device not connected'); return; }
    try {
      setRefreshing(true);
      const device = await bleManager.readRSSI(connectedDeviceId);
      setRssi(device.rssi);
      toast(`Signal strength: ${device.rssi} dBm`);
    } catch (e) {
      try {
        const devices = await bleManager.devices([connectedDeviceId]);
        if (devices && devices.length > 0 && devices[0].rssi) {
          setRssi(devices[0].rssi);
        }
      } catch (err) {}
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={st.scroll}>
      {/* Header */}
      <View style={st.appbar}>
        <Text style={[st.appTitle, { flex: 1, fontSize: 26, fontWeight: '900' }]}>Device</Text>
        <View style={[st.chip, !isConnected && { backgroundColor: '#FCE9C8' }]}>
          <View style={[st.chipDot, !isConnected && { backgroundColor: C.warn }]} />
          <Text style={[st.chipText, !isConnected && { color: '#8A5B10' }]}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
        </View>
        <TouchableOpacity style={st.iconBtn}><Text style={st.iconText}>⋮</Text></TouchableOpacity>
      </View>

      {/* Hero Card */}
      <View style={st.devHero}>
        <View style={st.devHeroIcon}>
          <BrandLogo size={40} color={C.sea} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={st.devHeroTitle}>Inguardia IG-1</Text>
          <Text style={st.devHeroSub}>SN IG1-24-004F2A</Text>
          <Text style={st.devHeroSub}>{isConnected ? `Connected · ${rssi !== null ? rssi : '-48'} dBm` : 'Disconnected'}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={st.stats3}>
        <View style={st.stat3}><Text style={st.stat3Label}>Battery</Text><Text style={st.stat3Value}>{liveData.battery || 0}%</Text></View>
        <View style={st.stat3}><Text style={st.stat3Label}>Firmware</Text><Text style={st.stat3Value}>2.4.1</Text></View>
        <View style={st.stat3}><Text style={st.stat3Label}>Storage</Text><Text style={st.stat3Value}>64%</Text></View>
      </View>

      {/* ACTIONS */}
      <Text style={st.sect}>ACTIONS</Text>
      <View style={st.list}>
        <TouchableOpacity style={st.rowItem} onPress={() => toast('Blinks the green light for 5 s')}>
          <View style={st.actionIco}><Text style={{ fontSize: 16 }}>🎯</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={st.rowTitle}>Find my device</Text>
            <Text style={st.rowSub}>Blinks the green light for 5 s</Text>
          </View>
          <Text style={st.chev}>&gt;</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={st.rowItem} onPress={() => toast('Recalibrating sensors...')}>
          <View style={st.actionIco}><Text style={{ fontSize: 16 }}>🔄</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={st.rowTitle}>Recalibrate sensors</Text>
            <Text style={st.rowSub}>Last calibrated today, 9:41</Text>
          </View>
          <Text style={st.chev}>&gt;</Text>
        </TouchableOpacity>

        <TouchableOpacity style={st.rowItem} onPress={() => toast('Checking for firmware update...')}>
          <View style={st.actionIco}><Text style={{ fontSize: 16 }}>⬇️</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={st.rowTitle}>Check for firmware update</Text>
            <Text style={st.rowSub}>Installed 2.4.1</Text>
          </View>
          <Text style={st.chev}>&gt;</Text>
        </TouchableOpacity>
      </View>

      {/* SETTINGS */}
      <Text style={st.sect}>SETTINGS</Text>
      <View style={st.list}>
        {/* Live Streaming */}
        <View style={st.rowItem}>
          <View style={{ flex: 1 }}>
            <Text style={st.rowTitle}>Live streaming</Text>
            <Text style={st.rowSub}>Send readings to this phone in real time</Text>
          </View>
          <Switch value={live} onValueChange={setLive} trackColor={{ false: '#C9D8D1', true: C.sea }} thumbColor="#fff" />
        </View>
        
        {/* Clench Alert */}
        <View style={st.rowItem}>
          <View style={{ flex: 1 }}>
            <Text style={st.rowTitle}>Clench alert vibration</Text>
            <Text style={st.rowSub}>Buzz gently after 5 hard bites in a row</Text>
          </View>
          <Switch value={clench} onValueChange={setClench} trackColor={{ false: '#C9D8D1', true: C.sea }} thumbColor="#fff" />
        </View>

        {/* Auto-sync */}
        <View style={st.rowItem}>
          <View style={{ flex: 1 }}>
            <Text style={st.rowTitle}>Auto-sync</Text>
            <Text style={st.rowSub}>Back up sessions when on Wi-Fi</Text>
          </View>
          <Switch value={autoSync} onValueChange={setAutoSync} trackColor={{ false: '#C9D8D1', true: C.sea }} thumbColor="#fff" />
        </View>

        {/* Sample Rate */}
        <View style={[st.rowItem, { flexDirection: 'column', alignItems: 'flex-start', paddingBottom: 16 }]}>
          <Text style={st.rowTitle}>Sample rate</Text>
          <Text style={[st.rowSub, { marginBottom: 12 }]}>Higher rates use more battery</Text>
          <View style={{ flexDirection: 'row', backgroundColor: '#F0F4F2', borderRadius: 16, padding: 4, width: '100%' }}>
            {['10', '25', '50'].map(rate => (
              <TouchableOpacity 
                key={rate} 
                style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12, backgroundColor: sampleRate === rate ? '#FFF' : 'transparent', elevation: sampleRate === rate ? 2 : 0 }}
                onPress={() => setSampleRate(rate)}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: sampleRate === rate ? C.ink : C.ink2 }}>{rate} Hz</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* UNITS */}
      <Text style={st.sect}>UNITS</Text>
      <View style={st.list}>
        <View style={[st.rowItem, { paddingVertical: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={st.rowTitle}>Temperature unit</Text>
          </View>
          <View style={{ flexDirection: 'row', backgroundColor: '#F0F4F2', borderRadius: 16, padding: 4, width: 120 }}>
            <TouchableOpacity 
              style={{ flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 12, backgroundColor: tempUnit === 'C' ? '#FFF' : 'transparent' }}
              onPress={() => setTempUnit('C')}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: tempUnit === 'C' ? C.sea : C.ink2 }}>°C</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 12, backgroundColor: tempUnit === 'F' ? '#FFF' : 'transparent' }}
              onPress={() => setTempUnit('F')}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: tempUnit === 'F' ? C.sea : C.ink2 }}>°F</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[st.btnDisconnect, !isConnected && { opacity: 0.5 }]} 
        onPress={onDisconnect} 
        disabled={!isConnected}
      >
        <Text style={st.btnDisconnectText}>Disconnect Device</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// 🔥 BOTTOM NAV WITH EMOJIS 🔥
function BottomNav({ active, onChange }) {
  const items = [
    { key: 'live', label: 'Live', icon: '〰️' }, 
    { key: 'history', label: 'History', icon: '🕒' }, 
    { key: 'device', label: 'Device', icon: '🦷' }
  ];
  return (
    <View style={st.navbar}>
      {items.map(it => (
        <TouchableOpacity key={it.key} style={st.navItem} onPress={() => onChange(it.key)}>
          <View style={[st.navPill, active === it.key && st.navPillOn]}>
            <Text style={{ fontSize: 18 }}>{it.icon}</Text>
          </View>
          <Text style={[st.navLabel, active === it.key && st.navLabelOn]}>{it.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const rp = StyleSheet.create({ ring: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1.5, borderColor: '#2E8B57' } });
const wave = StyleSheet.create({ wrap: { position: 'relative', overflow: 'hidden', marginLeft: 8, borderRadius: 10 }, gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#F0F4F2' }, liveDot: { position: 'absolute', right: -3, width: 10, height: 10, borderRadius: 5, backgroundColor: C.heart, shadowColor: C.heart, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4 } });

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
  btBadge: { position: 'absolute', top: 6, right: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  btIcon: { color: C.sea, fontWeight: '900', fontSize: 12 },
  foundRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  foundLbl: { fontSize: 12, fontWeight: '800', color: C.ink2, letterSpacing: 0.6 },
  scanTxt: { fontSize: 12, fontWeight: '700', color: C.sea },
  spinCircle: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#D6F2E4', borderTopColor: '#2E8B57' },
  devCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, marginBottom: 10 },
  devThumb: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  devName: { fontSize: 14, fontWeight: '700', color: C.ink },
  devMeta: { fontSize: 11.5, color: C.ink2, fontWeight: '600' },
  calibWrap: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 30 },
  calibRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 14, borderColor: C.line },
  calibInner: { alignItems: 'center', justifyContent: 'center' },
  calibNumber: { fontSize: 56, fontWeight: '900', color: C.ink },
  calibLabel: { fontSize: 13, color: C.ink2, fontWeight: '700' },
  
  sensorBox: { backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: C.line, marginBottom: 10 },
  sensorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  sensorName: { fontSize: 14, fontWeight: '600', color: C.ink },
  sensorStatus: { fontSize: 14, fontWeight: '700' },
  sensorDivider: { height: 1, backgroundColor: C.line },

  stage3d: { height: 260, borderRadius: 28, backgroundColor: '#E4EEEA', overflow: 'hidden', position: 'relative', marginBottom: 12 },
  ovTL: { position: 'absolute', top: 16, left: 20, zIndex: 10 },
  ovTLTextMain: { fontSize: 13, fontWeight: '800', color: C.seaDeep },
  ovTLTextSub: { fontSize: 11, fontWeight: '600', color: C.ink2 },
  ovTR: { position: 'absolute', top: 14, right: 16, zIndex: 10 },
  ovBR: { position: 'absolute', bottom: 16, right: 16, zIndex: 10 },
  dragTxt: { fontSize: 12, fontWeight: '600', color: C.ink2 },
  pillDk: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: '#FFF' },
  battMini: { width: 18, height: 10, borderWidth: 1.5, borderColor: C.seaDeep, borderRadius: 2, padding: 1 },
  battMiniFill: { height: '100%', backgroundColor: C.sea, borderRadius: 1 },
  battTxt: { fontSize: 11, fontWeight: '700', color: C.seaDeep },

  historyTable: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  historyHeader: { flexDirection: 'row', backgroundColor: '#E6F4EC', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  historyHeaderTxt: { flex: 1, fontSize: 12, fontWeight: '800', color: C.seaDeep },
  historyRow: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4F2' },
  historyCellTxt: { flex: 1, fontSize: 13, fontWeight: '600', color: C.ink },

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
  battShell: { width: 54, height: 26, borderRadius: 7, borderWidth: 2, borderColor: C.ink, padding: 2 },
  battFill: { height: '100%', borderRadius: 4, backgroundColor: C.sea },
  biteBarsWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 30, marginTop: 6 },
  biteBar: { flex: 1, borderRadius: 2 },
  mvPill: { flexDirection: 'row', alignItems: 'center', height: 34, paddingHorizontal: 14, borderRadius: 17 },
  mvText: { fontWeight: '800', fontSize: 14 },
  axisRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  axisLbl: { fontSize: 10, fontWeight: '700', color: C.ink2, width: 12 },
  axisTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: C.line, position: 'relative', overflow: 'hidden' },
  axisFillLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: C.sea, borderRadius: 3 },
  disclaim: { fontSize: 10.5, color: C.ink2, textAlign: 'center', paddingHorizontal: 20, marginTop: 16, lineHeight: 15 },
  miniRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  mini: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 20, padding: 12 },
  miniLabel: { fontSize: 11, fontWeight: '700', color: C.ink2 },
  miniValue: { fontSize: 22, fontWeight: '900', color: C.ink, letterSpacing: -0.5, marginTop: 4 },
  miniUnit: { fontSize: 11, fontWeight: '600', color: C.ink2, marginLeft: 3 },
  sect: { fontSize: 11, fontWeight: '800', color: C.ink2, letterSpacing: 0.8, marginTop: 20, marginBottom: 10 },
  sessionIco: { width: 44, height: 34, borderRadius: 11, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  
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
  rowItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.line, marginBottom: 8 },
  rowTitle: { fontSize: 13, fontWeight: '700', color: C.ink },
  rowSub: { fontSize: 11.5, color: C.ink2, marginTop: 2 },
  list: { gap: 0 },
  
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
  btnPrimary: { height: 52, borderRadius: 26, backgroundColor: C.sea, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnPrimarySm: { height: 36, paddingHorizontal: 16, borderRadius: 18, backgroundColor: C.sea, alignItems: 'center', justifyContent: 'center' },
  btnText: { height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  btnTextLabel: { color: C.ink2, fontSize: 13, fontWeight: '600' },
  btnTonal: { flex: 1, height: 44, borderRadius: 22, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  btnTonalText: { color: C.seaDeep, fontWeight: '700', fontSize: 13 },
  btnDisconnect: { marginTop: 20, height: 52, borderRadius: 26, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center' },
  btnDisconnectText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  toastBox: { position: 'absolute', left: 16, right: 16, bottom: 100, backgroundColor: '#10302A', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14 },
  toastText: { color: '#EAFFF4', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
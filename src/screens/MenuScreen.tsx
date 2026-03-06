import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, Image, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { ROUTES } from '../navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Menu'>;

const LOGO = require('../assets/menu_logo.png'); 

type Item = {
  key: string;
  label: string;
  route:
    | typeof ROUTES.ArticlesPaper
    | typeof ROUTES.QuizIntro
    | typeof ROUTES.MiniGameIntroNotChosenContainer
    | typeof ROUTES.PointsExchangeArticles
    | typeof ROUTES.AchievementsAllLocked;
};

export default function MenuScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 740 || width < 375;

  const items: Item[] = useMemo(
    () => [
      { key: 'articles', label: 'Articles', route: ROUTES.ArticlesPaper },
      { key: 'quiz', label: 'Quiz', route: ROUTES.QuizIntro },
      { key: 'mini', label: 'Mini Game', route: ROUTES.MiniGameIntroNotChosenContainer },
      { key: 'exchange', label: 'Exchange Eco Points', route: ROUTES.PointsExchangeArticles },
      { key: 'ach', label: 'Achievements', route: ROUTES.AchievementsAllLocked },
    ],
    []
  );

  const [focused, setFocused] = useState(0);

  const appear = useRef(new Animated.Value(0)).current;
  const hiliteY = useRef(new Animated.Value(0)).current;

  const rowH = isSmall ? 44 : 48;
  const listW = Math.min(560, width - 40);
  const hiliteH = isSmall ? 34 : 36;
  const hiliteRadius = 16;

  const listTopPad = isSmall ? 8 : 10;
  const listBottomPad = isSmall ? 6 : 8;

  const titleTop = Math.max(insets.top + (isSmall ? 10 : 18), isSmall ? 18 : 26);

  const logoSize = Math.round(Math.min(220, width * (isSmall ? 0.42 : 0.46)));

  const calcHiliteTop = (i: number) => listTopPad + i * rowH + Math.round((rowH - hiliteH) / 2);

  useEffect(() => {
    setFocused(0);
    hiliteY.setValue(calcHiliteTop(0));

    appear.setValue(0);
    Animated.timing(appear, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const moveHilite = (i: number) => {
    Animated.timing(hiliteY, {
      toValue: calcHiliteTop(i),
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const openItem = (i: number) => {
    setFocused(i);
    moveHilite(i);

    const r = items[i].route;
    setTimeout(() => {
      navigation.navigate(r as any);
    }, 120);
  };

  const openSettings = () => navigation.navigate(ROUTES.Settings as any);

  const fadeIn = appear.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const down = appear.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });

  const leftCircleSize = isSmall ? 120 : 150;
  const rightCircleSize = isSmall ? 100 : 120;

  return (
    <View style={styles.root}>
      <View
        pointerEvents="none"
        style={[
          styles.leftCircle,
          {
            width: leftCircleSize,
            height: leftCircleSize,
            borderRadius: leftCircleSize,
            top: titleTop + 60,
            left: 20,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.rightCircle,
          {
            width: rightCircleSize,
            height: rightCircleSize,
            borderRadius: rightCircleSize,
            top: titleTop + 120,
            right: 22,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.headerWrap,
          {
            paddingTop: titleTop,
            opacity: fadeIn,
            transform: [{ translateY: down }],
          },
        ]}
      >
        <Text style={[styles.header, { fontSize: isSmall ? 20 : 22 }]}>Menu</Text>
        <Text style={[styles.sub, { fontSize: isSmall ? 13 : 14 }]}>Tap to open a section</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.centerWrap,
          {
            opacity: fadeIn,
            transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
          },
        ]}
      >
        <View style={[styles.list, { width: listW, paddingTop: listTopPad, paddingBottom: listBottomPad }]}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.hilite,
              {
                top: hiliteY,
                left: 0,
                right: 0,
                height: hiliteH,
                borderRadius: hiliteRadius,
              },
            ]}
          />

          {items.map((it, i) => (
            <Pressable key={it.key} onPress={() => openItem(i)} style={[styles.row, { height: rowH }]}>
              <Text style={[styles.rowText, { fontSize: isSmall ? 26 : 28 }]}>{it.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={openSettings} style={[styles.settingsBtn, { marginTop: isSmall ? 18 : 24, width: Math.min(320, width - 110) }]}>
          <Text style={[styles.settingsText, { fontSize: isSmall ? 22 : 24 }]}>Settings</Text>
        </Pressable>

        <View style={{ height: isSmall ? 18 : 22 }} />

        <Image source={LOGO} style={{ width: logoSize, height: logoSize, opacity: 0.95 }} resizeMode="contain" />
      </Animated.View>

      <View style={{ height: Math.max(insets.bottom, 12) }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#6B4BD9' },

  headerWrap: { alignItems: 'center' },
  header: { color: '#FFFFFF', fontWeight: '800' },
  sub: { marginTop: 8, color: '#FFFFFF', opacity: 0.65, fontWeight: '700' },

  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },

  list: { alignSelf: 'center' },

  hilite: {
    position: 'absolute',
    backgroundColor: '#F08BC5',
    opacity: 0.95,
  },

  row: { alignItems: 'center', justifyContent: 'center' },
  rowText: {
    color: '#111',
    fontWeight: '900',
    textAlign: 'center',
  },

  settingsBtn: {
    height: 70,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: { color: '#FFFFFF', fontWeight: '900' },

  leftCircle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.10)' },
  rightCircle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.10)' },
});
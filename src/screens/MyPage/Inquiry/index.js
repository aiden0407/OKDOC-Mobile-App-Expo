//React
import { useEffect, useContext } from 'react';
import { ApiContext } from 'context/ApiContext';

//Components
import { SafeArea } from 'components/Layout';
import { WebView } from 'react-native-webview';

export default function InquiryScreen({ navigation, route }) {

  const { state: ApiContextState } = useContext(ApiContext);

  useEffect(() => {
    navigation.setOptions({
      title: route.params?.headerTitle ?? '문의하기'
    });
  }, [navigation]);

  return (
    <SafeArea>
      <WebView
        source={{ uri: `https://zoom.okdoc.app/inquiry/?userName=${ApiContextState.profileData[0].name}&userEmail=${ApiContextState.accountData.email}` }}
      />
    </SafeArea>
  );
}
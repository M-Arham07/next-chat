import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { useUniwind } from 'uniwind';
import { BrandingSection } from './_components/branding-section';
import { LoginForm } from './_components/login-form';

const SCREEN_OPTIONS = {
  title: 'Auth',
  headerTransparent: true,
};

export default function AuthScreen() {
  const [showForm, setShowForm] = React.useState(false);
  const { theme } = useUniwind();

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        {!showForm ? (
          <BrandingSection onSignInClick={() => setShowForm(true)} />
        ) : (
          <LoginForm onBack={() => setShowForm(false)} />
        )}
      </ScrollView>
    </View>
  );
}

import { Redirect } from 'expo-router';

export default function Index() {
  // In a real app we'd check session logic here, but for now we redirect to chat directly
  // like typical mobile app entry flows.
  return <Redirect href="/chat" />;
}

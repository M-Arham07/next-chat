import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

function stripMotionProps(props: any) {
  const {
    animate,
    exit,
    initial,
    layout,
    layoutId,
    transition,
    variants,
    whileHover,
    whileTap,
    whileInView,
    ...rest
  } = props;

  void animate;
  void exit;
  void initial;
  void layout;
  void transition;
  void variants;
  void whileHover;
  void whileTap;
  void whileInView;

  return rest;
}

function MotionView(props: any) {
  return <View {...stripMotionProps(props)} />;
}

function MotionPressable(props: any) {
  return <Pressable {...stripMotionProps(props)} />;
}

function MotionText(props: any) {
  return <Text {...stripMotionProps(props)} />;
}

export function AnimatePresence({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export const motion = {
  div: MotionView,
  main: MotionView,
  section: MotionView,
  aside: MotionView,
  header: MotionView,
  footer: MotionView,
  nav: MotionView,
  span: MotionText,
  p: MotionText,
  h1: MotionText,
  h2: MotionText,
  h3: MotionText,
  button: MotionPressable,
  View: MotionView,
  Text: MotionText,
  Pressable: MotionPressable,
};

import React, { useEffect, useRef } from 'react'
import { Animated, Text, View } from 'react-native'

type Props = {
  typingUsers: { user_id: number; user_name: string }[]
}

function TypingDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [delay, opacity])

  return (
    <Animated.View
      style={{
        opacity,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#94a3b8',
        marginHorizontal: 2,
      }}
    />
  )
}

export const TypingIndicator = React.memo(function TypingIndicator({
  typingUsers,
}: Props) {
  if (typingUsers.length === 0) return null

  const names = typingUsers.map((t) => t.user_name)
  let label: string
  if (names.length === 1) {
    label = `${names[0]} đang nhập`
  } else if (names.length === 2) {
    label = `${names[0]} và ${names[1]} đang nhập`
  } else {
    label = 'Nhiều người đang nhập'
  }

  return (
    <View className="flex-row items-center px-4 py-1.5">
      <View style={{ width: 28, marginRight: 6 }} />
      <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-2">
        <TypingDot delay={0} />
        <TypingDot delay={200} />
        <TypingDot delay={400} />
      </View>
      <Text className="text-xs text-slate-400 ml-2">{label}</Text>
    </View>
  )
})

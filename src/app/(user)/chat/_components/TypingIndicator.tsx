import { MaterialIcons } from '@expo/vector-icons'
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
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#089166',
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
    label = `${names[0]} đang soạn tin...`
  } else if (names.length === 2) {
    label = `${names[0]} và ${names[1]} đang soạn tin...`
  } else {
    label = 'Nhiều người đang soạn tin...'
  }

  return (
    <View className="flex-row items-center px-4 py-2">
      {/* Avatar */}
      <View
        className="size-8 rounded-full items-center justify-center mr-2"
        style={{
          backgroundColor: '#d1fae5',
          borderWidth: 2,
          borderColor: '#089166',
        }}
      >
        <MaterialIcons name="more-horiz" size={18} color="#089166" />
      </View>

      {/* Typing bubble */}
      <View
        className="flex-row items-center rounded-2xl px-3 py-2"
        style={{
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#d1fae5',
        }}
      >
        <TypingDot delay={0} />
        <TypingDot delay={200} />
        <TypingDot delay={400} />
      </View>

      <Text
        className="text-xs ml-2"
        style={{ color: '#089166', fontWeight: '500' }}
      >
        {label}
      </Text>
    </View>
  )
})

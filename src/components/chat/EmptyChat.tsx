import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  title?: string
  subtitle?: string
}

export function EmptyChat({
  title = 'Chưa có cuộc trò chuyện',
  subtitle = 'Bắt đầu trò chuyện với người chơi khác hoặc liên hệ hỗ trợ',
}: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View
        className="size-20 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: '#d1fae5' }}
      >
        <MaterialIcons name="chat-bubble-outline" size={40} color="#089166" />
      </View>
      <Text className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2 text-center">
        {title}
      </Text>
      <Text className="text-sm text-slate-400 text-center leading-5">
        {subtitle}
      </Text>
    </View>
  )
}

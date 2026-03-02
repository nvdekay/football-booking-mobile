import { MaterialIcons } from '@expo/vector-icons'
import React, { useCallback, useState } from 'react'
import {
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

type Props = {
  onSend: (text: string) => void
  onTyping: () => void
  disabled?: boolean
}

export const ChatInput = React.memo(function ChatInput({
  onSend,
  onTyping,
  disabled = false,
}: Props) {
  const [text, setText] = useState('')

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }, [text, onSend])

  const handleChangeText = useCallback(
    (value: string) => {
      setText(value)
      if (value.length > 0) {
        onTyping()
      }
    },
    [onTyping]
  )

  return (
    <View
      className="flex-row items-end px-3 bg-white dark:bg-slate-900"
      style={{
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        borderTopWidth: 0.5,
        borderTopColor: '#e2e8f0',
      }}
    >
      <View
        className="flex-1 flex-row items-end bg-slate-100 dark:bg-slate-800 rounded-3xl mr-2"
        style={{
          minHeight: 40,
          maxHeight: 120,
          paddingHorizontal: 16,
          paddingVertical: Platform.OS === 'ios' ? 10 : 6,
        }}
      >
        <TextInput
          className="flex-1 text-base text-slate-800 dark:text-white"
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#94a3b8"
          value={text}
          onChangeText={handleChangeText}
          multiline
          maxLength={2000}
          editable={!disabled}
          style={{
            maxHeight: 100,
            lineHeight: 20,
          }}
        />
      </View>

      <TouchableOpacity
        onPress={handleSend}
        disabled={disabled || text.trim().length === 0}
        activeOpacity={0.7}
        className="items-center justify-center rounded-full"
        style={{
          width: 40,
          height: 40,
          backgroundColor:
            text.trim().length > 0 ? '#089166' : '#e2e8f0',
        }}
      >
        <MaterialIcons
          name="send"
          size={20}
          color={text.trim().length > 0 ? '#ffffff' : '#94a3b8'}
        />
      </TouchableOpacity>
    </View>
  )
})

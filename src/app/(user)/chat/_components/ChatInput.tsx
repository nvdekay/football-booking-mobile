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

  const canSend = text.trim().length > 0

  return (
    <View
      className="px-3 bg-white dark:bg-slate-900"
      style={{
        paddingTop: Platform.OS === 'ios' ? 10 : 5,
        paddingBottom: Platform.OS === 'ios' ? 10 : 5,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
      }}
    >
      <View
        className="flex-row items-end"
        style={{
          backgroundColor: '#ecfdf5',
          borderRadius: 16,
          paddingHorizontal: 6,
          paddingVertical: 4,
        }}
      >

        {/* Text input */}
        <View
          className="flex-1"
          style={{
            minHeight: 36,
            maxHeight: 100,
            justifyContent: 'center',
            paddingHorizontal: 8,
          }}
        >
          <TextInput
            className="text-base text-slate-800 dark:text-white"
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#94a3b8"
            value={text}
            onChangeText={handleChangeText}
            multiline
            maxLength={2000}
            editable={!disabled}
            style={{
              maxHeight: 80,
              lineHeight: 20,
              paddingVertical: Platform.OS === 'ios' ? 8 : 4,
            }}
          />
        </View>

        {/* Send button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={disabled || !canSend}
          activeOpacity={0.7}
          className="items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: canSend ? '#089166' : '#d1fae5',
          }}
        >
          <MaterialIcons
            name="send"
            size={20}
            color={canSend ? '#ffffff' : '#94a3b8'}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
})

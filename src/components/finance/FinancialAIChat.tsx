
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { useFinancialAI } from '@/hooks/useFinancialAI';

export const FinancialAIChat = () => {
  const { messages, sendMessage, clearChat, isLoading } = useFinancialAI();
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоматическая прокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <strong key={index} className="font-semibold">{line.slice(2, -2)}</strong>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4">{line.slice(2)}</li>;
        }
        return <p key={index} className="mb-2">{line}</p>;
      });
  };

  return (
    <Card className="h-[calc(100vh-12rem)] max-h-[700px] min-h-[500px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Финансовый Аналитик
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-2 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 break-words ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm">
                      {formatMessage(message.content)}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <Separator />
        <div className="flex-shrink-0 p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Спросите о ваших финансах..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Примеры: "Проанализируй мои расходы за месяц", "Какие тренды в продажах?", "Где можно оптимизировать затраты?"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

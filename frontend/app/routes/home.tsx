import type { Route } from "./+types/home";
import React, { useState, useRef, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chat com o Agente" },
    { name: "description", content: "Interface de chat com um agente virtual." },
  ];
}

export default function Home() {
  const [messages, setMessages] = useState([
    { id: 1, who: "agent", text: "Olá! Eu sou o agente virtual. Como posso ajudar?", time: Date.now() - 1000 * 60 * 6 },
    { id: 2, who: "user", text: "Oi! Quero testar este chat.", time: Date.now() - 1000 * 60 * 4 },
  ]);
  const [value, setValue] = useState("");
  const [agentTyping, setAgentTyping] = useState(false);
  const [dark, setDark] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, agentTyping]);

  const nextId = () => Math.max(0, ...messages.map((m) => m.id)) + 1;

  const send = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg = { id: nextId(), who: "user", text: trimmed, time: Date.now() };
    setMessages((s) => [...s, userMsg]);
    setValue("");
    // Integração com backend pode ser adicionada aqui
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(value);
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`${dark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} flex flex-col h-screen p-4`}> 
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Chat com o Agente</h1>
        <button onClick={() => setDark(!dark)} className="text-sm px-2 py-1 border rounded">
          {dark ? "Modo Claro" : "Modo Escuro"}
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 p-2 border rounded bg-white/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.who === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-3 py-2 rounded-2xl shadow ${
                msg.who === "user" ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-300 text-gray-900 rounded-bl-none"
              }`}
            >
              <p>{msg.text}</p>
              <span className="text-[10px] opacity-70 block text-right mt-1">{formatTime(msg.time)}</span>
            </div>
          </div>
        ))}
        {agentTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-300 text-gray-900 px-3 py-2 rounded-2xl rounded-bl-none shadow animate-pulse">
              Digitando...
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end space-x-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          className="flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring"
          rows={2}
        />
        <button
          onClick={() => send(value)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

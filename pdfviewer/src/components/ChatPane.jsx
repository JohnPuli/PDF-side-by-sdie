import React, { useState, useRef, useEffect } from "react";

export default function ChatPane() {
  const [messages, setMessages] = useState([
    { id:1, role:'assistant', text: 'Welcome to Frontline Copilot chat. What can I help you with today?' }
  ]);
  const [text, setText] = useState("");
  const bodyRef = useRef(null);

  function send(msg) {
    if (!msg) return;
    setMessages(prev => [...prev, { id: Date.now(), role:'user', text: msg }]);
    setText("");
    setTimeout(()=> {
      setMessages(prev => [...prev, { id: Date.now()+1, role:'assistant', text: 'Simulated response referencing a document chunk.' }]);
    }, 600);
  }

  useEffect(()=> {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-card">
      <div className="chat-header">
        <div>
          <div className="chat-title">Frontline Copilot®</div>
          <div className="chat-sub">May 16, 2025</div>
        </div>
        <div className="small">•</div>
      </div>

      <div className="chat-body" ref={bodyRef}>
        {messages.map(m=>(
          <div key={m.id} className={`msg ${m.role === 'assistant' ? 'assistant':'user'}`}>{m.text}</div>
        ))}
      </div>

      <div className="chat-input">
        <input className="input-box" value={text} onChange={e=>setText(e.target.value)} placeholder="Ask a question..." onKeyDown={(e)=>{ if(e.key==='Enter'){ send(text) }}} />
        <button className="send-btn" onClick={()=>send(text)}>Send</button>
      </div>

      <div className="quick-row">
        <div className="quick-btn" onClick={()=>send('Q1')}>Q1</div>
        <div className="quick-btn" onClick={()=>send('Q2')}>Q2</div>
        <div className="quick-btn" onClick={()=>send('Q3')}>Q3</div>
      </div>
    </div>
  );
}

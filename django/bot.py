#!/usr/bin/env python 

import sqlite3 as db_api
import telebot
import random

token = 'abc'

def connect():
    conn = './db.sqlite3'
    try:
        return db_api.connect(conn)
    except Exception as e:
        print("ERROR: ", e)
        return None

bot = telebot.TeleBot(token)

def sendMessage(id, msg):
  try:
    bot.send_message(id, msg)
  except Exception as e:
    print("Nachricht konnte nicht gesendet werden", e)

def execDB(cursor, sql, args):
    try:
        cursor.execute(sql, args)
    except Exception as e:
        print(e)

@bot.message_handler(commands=['start'])
def register(message):
    db = connect()
    chats: db_api.Cursor = db.cursor()
    print(message.chat.id)
    chats.execute('SELECT verified, secretKey FROM api_telegramchat WHERE chatID=?', (message.chat.id,))
    chat = chats.fetchone()
    if chat == None:
        key = random.randint(10000, 1000000)
        sql = 'INSERT INTO api_telegramchat (secretKey, verified, chatID, abo) VALUES (?, 0, ?, 0)'
        c = db.cursor()
        execDB(c, sql, (key, message.chat.id))
        db.commit()
        c.close()
        msg = 'Herzlich Willkommen\nSende dieses Passwort an die "Leitung", um zu starten: ' + str(key)
    else:
        print(chat)
        v,k = chat
        msg = "Du hast schon eine Startanfrage gesendet!"
        if v == 0:
           msg += '\nDein Passwort ist: ' + str(k)  
    chats.close()    
    sendMessage(message.chat.id, msg)
    db.close()
    
def setAbo(chat_id: int, start: bool):
    db = connect()
    c = db.cursor()
    sql = 'SELECT verified FROM api_telegramchat WHERE chatID=?'
    execDB(c, sql, (chat_id,))
    chat = c.fetchone()
    if chat == None:
        sendMessage(chat_id, "Bitte registriere dich zuerst mit /start")
    else:
        v, = chat
        if v == True:
            sql = 'UPDATE api_telegramchat SET abo=? WHERE chatID=?'
            u = db.cursor()
            execDB(u, sql, (start, chat_id))
            db.commit()
            u.close()
            sendMessage(chat_id, "Gespeichert! Danke")
        else:
            sendMessage(chat_id, "Bitte warte bis die Registrierung abgeschlossen ist")
    c.close()
    db.close()

@bot.message_handler(commands=['startabo'])
def aboStart(message):
    setAbo(message.chat.id, True)

@bot.message_handler(commands=['stopabo'])
def aboStop(message):
    setAbo(message.chat.id, False)

def main():
    bot.polling()
    

if __name__ == '__main__':main()
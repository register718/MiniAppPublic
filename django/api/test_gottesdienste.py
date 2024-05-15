from django.test import TestCase
from django.contrib.auth.models import User
import json
from .models import Messe, MesseArt, Plan
from django.db import models
import datetime

def compareToModel(model: models.Model, obj):
    for key in obj:
        try:
            attr = model.__getattribute__(key)
        except:
            return False
        if not attr == obj[key]:
            print(attr + " != " + obj[key])
            return False
    return True


class TestGottesdienste(TestCase):

    def setUp(self):
        user = User.objects.create(username="Test", is_active=True, email="test@test.com", is_superuser=True, is_staff=True)
        user.set_password("1234")
        user.save()
        self.assertTrue(self.client.login(username="Test", password="1234"))

    def test_AddArt(self):
        art = {"DayOfWeek": 1, "Zeit": "12:02", "MinisInsgesamt": 3, "OberminisAnzahl": 2, "Name": "TestGDART", "Print":"Starndart print"}
        response = self.client.post('/api/gottesdienste/art/neu/', json.dumps(art), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.getvalue().decode(), "ERROR")
        self.assertNotEqual(response.getvalue().decode(), "false")
        gdID = json.loads(response.getvalue().decode())
        try:
            db_art = MesseArt.objects.get(pk=gdID)
        except Exception:
            self.assertTrue(False)
        art["Zeit"] = datetime.time(hour=12, minute=2)
        self.assertTrue(compareToModel(db_art, art))

    def test_NotAddArt(self):
        art = {"DayOfWeek": 1, "Zeit": "12:02", "MinisInsgesamt": 3, "Name": "TestGDART", "Print":"Starndart print"}
        response = self.client.post('/api/gottesdienste/art/neu/', json.dumps(art), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.getvalue().decode(), "ERROR")
        self.assertEqual(response.getvalue().decode(), "false")
        resp = self.client.post('/api/gottesdienste/art/neu/', "{$ 345 OsFkjd? `'' \" 342§ <- Komisches Zeug", content_type="application/json")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.getvalue().decode(), "ERROR")


    def checkMesseArt(self, resp, messe):
      self.assertEqual(resp.status_code, 200)
      self.assertEqual(resp.getvalue().decode(), 'true')
      mDB = MesseArt.objects.get(pk=messe['id'])
      self.assertEqual(mDB.DayOfWeek, messe['DayOfWeek'])
      self.assertEqual(mDB.Name, messe['Name'])
      self.assertEqual(mDB.MinisInsgesamt, messe['MinisInsgesamt'])
      self.assertEqual(mDB.OberminisAnzahl, messe['OberminisAnzahl'])
      self.assertEqual(mDB.Print, messe['Print'])


    def test_UpdateMesseArt(self):
        MesseArt.objects.create(DayOfWeek=2, Zeit=datetime.time(16, 59), MinisInsgesamt=19, OberminisAnzahl=4, Name="Test1", Print="Standart")
        MesseArt.objects.create(DayOfWeek=2, Zeit=datetime.time(15, 0), MinisInsgesamt=1, OberminisAnzahl=3, Name="Test2", Print="Standart")
        MesseArt.objects.create(DayOfWeek=3, Zeit=datetime.time(1, 59), MinisInsgesamt=3, OberminisAnzahl=2, Name="Test3", Print="Standart")
        MesseArt.objects.create(DayOfWeek=4, Zeit=datetime.time(15, 35), MinisInsgesamt=8, OberminisAnzahl=6, Name="Test4", Print="Standart")
        MesseArt.objects.create(DayOfWeek=-1, Zeit=datetime.time(11, 59), MinisInsgesamt=3, OberminisAnzahl=7, Name="Test5", Print="Standart")
        MesseArt.objects.create(DayOfWeek=-1, Zeit=datetime.time(11, 59), MinisInsgesamt=3, OberminisAnzahl=7, Name="Test5", Print="Standart")

        response_Messen = self.client.get('/api/gottesdienste/art/all/')
        self.assertEqual(response_Messen.status_code, 200)
        try:
          messenData = json.loads(response_Messen.getvalue().decode())
        except Exception:
          self.assertTrue(False)
        self.assertIsNotNone(messenData['data'])
        messenList = messenData['data']
        self.assertEqual(len(messenList), 6)

        aktInx = 0
        messenList[aktInx]['DayOfWeek'] = 4
        resp = self.client.post('/api/gottesdienste/art/update/' + str(messenList[aktInx]['id']) + '/', messenList[aktInx], content_type="application/json")
        self.checkMesseArt(resp, messenList[aktInx])

        aktInx = 1
        messenList[aktInx]['MinisInsgesamt'] = 12
        resp = self.client.post('/api/gottesdienste/art/update/' + str(messenList[aktInx]['id']) + '/', messenList[aktInx], content_type="application/json")
        self.checkMesseArt(resp, messenList[aktInx])

        aktInx = 2
        messenList[aktInx]['OberminisAnzahl'] = 100
        resp = self.client.post('/api/gottesdienste/art/update/' + str(messenList[aktInx]['id']) + '/', messenList[aktInx], content_type="application/json")
        self.checkMesseArt(resp, messenList[aktInx])

        aktInx = 3
        messenList[aktInx]['Name'] = 'Altername Schlecht'
        resp = self.client.post('/api/gottesdienste/art/update/' + str(messenList[aktInx]['id']) + '/', messenList[aktInx], content_type="application/json")
        self.checkMesseArt(resp, messenList[aktInx])

        aktInx = 4
        messenList[aktInx]['Print'] = '$WAS-IST-DAS'
        resp = self.client.post('/api/gottesdienste/art/update/' + str(messenList[aktInx]['id']) + '/', messenList[aktInx], content_type="application/json")
        self.checkMesseArt(resp, messenList[aktInx])

        aktInx = 5
        id = messenList[aktInx]['id']
        messenList[aktInx]['id'] = 100
        resp = self.client.post('/api/gottesdienste/art/update/' + str(messenList[aktInx]['id']) + '/', messenList[aktInx], content_type="application/json")
        self.assertEqual(resp.status_code, 404)

        aktInx = 5
        messenList[aktInx]['id'] = 3
        resp = self.client.post('/api/gottesdienste/art/update/' + str(id) + '/', messenList[aktInx], content_type="application/json")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.getvalue().decode(), 'false')

    def checkGottesdienstModel(self, messe, id):
      mDB = Messe.objects.get(pk=id)
      self.assertEqual(mDB.Info, messe['Info'])
      self.assertEqual(mDB.Art_id, messe['Art'])
      self.assertEqual(mDB.Plan_id_id, messe['Plan_id'])
      self.assertEqual(mDB.explizit, messe['explizit'])
      dateSplit = messe['Datum'].split('-')
      date = datetime.date(int(dateSplit[0]), int(dateSplit[1]), int(dateSplit[2]))
      self.assertEqual(mDB.Datum, date)

    def test_GottesdienstHinzufuegen(self):
      MesseArt.objects.create(DayOfWeek=2, Zeit=datetime.time(16, 59), MinisInsgesamt=19, OberminisAnzahl=4, Name="Test1", Print="Standart")
      MesseArt.objects.create(DayOfWeek=-1, Zeit=datetime.time(15, 0), MinisInsgesamt=1, OberminisAnzahl=3, Name="Test2", Print="Standart")
      art = MesseArt.objects.all()
      gdObj = {'Datum':'2020-12-03', 'Info':'Tolle Info', 'Art':art[0].id, 'Plan_id': None, 'Gruppen': None, 'explizit': False}

      resp = self.client.post('/api/gottesdienste/messe/neu/', gdObj, content_type='application/json')
      self.assertEqual(resp.status_code, 200)
      self.assertNotEqual(resp.getvalue().decode(), 'ERROR')
      self.assertNotEqual(resp.getvalue().decode(), 'false')
      try:
        idAkt = json.loads(resp.getvalue().decode())
      except:
        self.assertEqual('String', 'Zahl')
      self.checkGottesdienstModel(gdObj, idAkt)
      #gdKaputt
      gdObj['Datum'] = '123455'
      resp = self.client.post('/api/gottesdienste/messe/neu/', gdObj, content_type='application/json')
      self.assertEqual(resp.status_code, 200)
      self.assertEqual(resp.getvalue().decode(), 'false')

    def test_GottesdienstAendern(self):
      art1 = MesseArt.objects.create(DayOfWeek=2, Zeit=datetime.time(16, 59), MinisInsgesamt=19, OberminisAnzahl=4, Name="Test1", Print="Standart")
      art2 = MesseArt.objects.create(DayOfWeek=-1, Zeit=datetime.time(15, 0), MinisInsgesamt=1, OberminisAnzahl=3, Name="Test2", Print="Standart")
      plan = Plan.objects.create(Name="Test", PlanArt=0)

      gdObj = {'Datum':'2020-12-03', 'Info':'Tolle Info', 'Art':art1.id, 'Plan_id': None, 'Gruppen': None, 'explizit': False}
      resp = self.client.post('/api/gottesdienste/messe/neu/', gdObj, content_type="application/json")
      self.assertEqual(resp.status_code, 200)
      self.assertNotEqual(resp.getvalue().decode(), 'false')
      self.assertNotEqual(resp.getvalue().decode(), 'ERROR')
      mID = json.loads(resp.getvalue().decode())

      gdObj['Datum'] = "2022-10-30"
      resp = self.client.post('/api/gottesdienste/messe/update/' + str(mID) + '/', gdObj, content_type='application/json')
      self.assertEqual(resp.status_code, 200)
      self.assertEqual(resp.getvalue().decode(), 'true')
      self.checkGottesdienstModel(gdObj, mID)

      gdObj['Art'] = art2.id
      resp = self.client.post('/api/gottesdienste/messe/update/' + str(mID) + '/', gdObj, content_type='application/json')
      self.assertEqual(resp.status_code, 200)
      self.assertEqual(resp.getvalue().decode(), 'true')
      self.checkGottesdienstModel(gdObj, mID)

      gdObj['explizit'] = True
      resp = self.client.post('/api/gottesdienste/messe/update/' + str(mID) + '/', gdObj, content_type='application/json')
      self.assertEqual(resp.status_code, 200)
      self.assertEqual(resp.getvalue().decode(), 'true')
      self.checkGottesdienstModel(gdObj, mID)

      gdObj['Info'] = "Eine Neue Info für den anderen GD"
      resp = self.client.post('/api/gottesdienste/messe/update/' + str(mID) + '/', gdObj, content_type='application/json')
      self.assertEqual(resp.status_code, 200)
      self.assertEqual(resp.getvalue().decode(), 'true')
      self.checkGottesdienstModel(gdObj, mID)

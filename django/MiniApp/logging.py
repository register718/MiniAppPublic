from django.utils.log import AdminEmailHandler

class AdminTelegramHandler(AdminEmailHandler):

    def send_mail(self, subject: str, message: str, *args, **kwargs) -> None:
        #print('REPORT:', message)
        from api.telegram_bot import sendReport
        sendReport(subject)
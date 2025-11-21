from ..models import Notification

class UserNotifications:
  def get_user_notifications(self, request):
    notifications = Notification.objects.filter(user=request.curr_user["user_id"], is_read=False)
    data = [{"id": str(n.id), "message": n.message, "created_at": n.created_at.isoformat()} for n in notifications]
    return data
  def read_user_notification(self, request, notification_id):
    notification = Notification.objects.filter(id=notification_id, user=request.curr_user["user_id"]).first()
    if notification:
      notification.is_read = True
      notification.save()
      return "OK"
    else: 
      return "Notification doesn't exist."
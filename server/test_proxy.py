import urllib.request; 
try:
    r = urllib.request.urlopen('http://127.0.0.1:3000/api/notifications')
    print(r.status)
except Exception as e:
    print(e)

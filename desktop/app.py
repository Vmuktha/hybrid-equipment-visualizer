import sys
import requests

from PyQt5.QtWidgets import (
    QApplication,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QPushButton,
    QLabel,
    QLineEdit,
    QFileDialog,
    QMessageBox
)


from PyQt5.QtCore import Qt

from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg
from matplotlib.figure import Figure


BASE_URL = "http://127.0.0.1:8000/api"


# Login Window
class LoginWindow(QWidget):

    def __init__(self):
        super().__init__()

        self.setWindowTitle("Chem Analyzer - Login")
        self.setGeometry(400, 200, 300, 200)

        self.layout = QVBoxLayout()

        self.username = QLineEdit()
        self.username.setPlaceholderText("Username")

        self.password = QLineEdit()
        self.password.setPlaceholderText("Password")
        self.password.setEchoMode(QLineEdit.Password)

        self.login_btn = QPushButton("Login")
        self.login_btn.clicked.connect(self.login)
        self.register_btn = QPushButton("Create Account")
        self.register_btn.clicked.connect(self.open_register)


        self.layout.addWidget(QLabel("Login"))
        self.layout.addWidget(self.username)
        self.layout.addWidget(self.password)
        self.layout.addWidget(self.login_btn)
        self.layout.addWidget(self.register_btn)


        self.setLayout(self.layout)

    def login(self):

        data = {
            "username": self.username.text(),
            "password": self.password.text()
        }

        res = requests.post(
            f"{BASE_URL}/token/",
            json=data
        )

        if res.status_code == 200:

            token = res.json()["access"]

            self.dashboard = DashboardWindow(token)
            self.dashboard.show()

            self.close()

        else:
            QMessageBox.warning(
                self,
                "Error",
                "Invalid Credentials"
            )
    def open_register(self):

        self.reg = RegisterWindow()
        self.reg.show()

class RegisterWindow(QWidget):

    def __init__(self):
        super().__init__()

        self.setWindowTitle("Create Account")
        self.setGeometry(450, 250, 300, 250)

        layout = QVBoxLayout()

        self.username = QLineEdit()
        self.username.setPlaceholderText("Username")

        self.email = QLineEdit()
        self.email.setPlaceholderText("Email")

        self.password = QLineEdit()
        self.password.setPlaceholderText("Password")
        self.password.setEchoMode(QLineEdit.Password)

        btn = QPushButton("Register")
        btn.clicked.connect(self.register)

        layout.addWidget(QLabel("Register"))
        layout.addWidget(self.username)
        layout.addWidget(self.email)
        layout.addWidget(self.password)
        layout.addWidget(btn)

        self.setLayout(layout)

    def register(self):

        data = {
            "username": self.username.text(),
            "email": self.email.text(),
            "password": self.password.text()
        }

        res = requests.post(
            f"{BASE_URL}/register/",
            json=data
        )

        if res.status_code == 201:

            QMessageBox.information(
                self,
                "Success",
                "Account Created!"
            )

            self.close()

        else:

            msg = res.json().get("error", "Failed")

            QMessageBox.warning(
                self,
                "Error",
                msg
            )

# Dashboard Window
class DashboardWindow(QWidget):

    def __init__(self, token):
        super().__init__()

        self.token = token

        self.setWindowTitle("Chem Analyzer - Dashboard")
        self.setGeometry(200, 100, 900, 600)

        self.layout = QVBoxLayout()

        # Buttons
        btn_layout = QHBoxLayout()

        self.upload_btn = QPushButton("Upload CSV")
        self.upload_btn.clicked.connect(self.upload_csv)

        self.report_btn = QPushButton("Download Report")
        self.report_btn.clicked.connect(self.download_report)

        self.logout_btn = QPushButton("Logout")
        self.logout_btn.clicked.connect(self.logout)

        btn_layout.addWidget(self.upload_btn)
        btn_layout.addWidget(self.report_btn)
        btn_layout.addWidget(self.logout_btn)

        self.layout.addLayout(btn_layout)

        # Stats Label
        self.stats_label = QLabel("No data loaded")
        self.stats_label.setAlignment(Qt.AlignCenter)

        self.layout.addWidget(self.stats_label)

        # Chart
        self.figure = Figure()
        self.canvas = FigureCanvasQTAgg(self.figure)

        self.layout.addWidget(self.canvas)

        self.setLayout(self.layout)

        self.fetch_latest()


    # API Headers
    def headers(self):
        return {
            "Authorization": f"Bearer {self.token}"
        }


    # Fetch Latest Data
    def fetch_latest(self):

        res = requests.get(
            f"{BASE_URL}/history/",
            headers=self.headers()
        )

        if res.status_code == 200:

            data = res.json()

            if data:

                latest = data[0]

                self.update_stats(latest["summary"])
                self.update_chart(latest["summary"]["type_distribution"])

 
    # Upload CSV
    def upload_csv(self):

        path, _ = QFileDialog.getOpenFileName(
            self,
            "Select CSV",
            "",
            "CSV Files (*.csv)"
        )

        if not path:
            return

        files = {
            "file": open(path, "rb")
        }

        res = requests.post(
            f"{BASE_URL}/upload/",
            files=files,
            headers=self.headers()
        )

        if res.status_code == 201:

            QMessageBox.information(
                self,
                "Success",
                "Upload Successful"
            )

            self.fetch_latest()

        else:
            QMessageBox.warning(
                self,
                "Error",
                "Upload Failed"
            )

    # Download PDF
    def download_report(self):

        res = requests.get(
           f"{BASE_URL}/report/",
            headers=self.headers()
        )

        if res.status_code == 200:

        #where to save
            path, _ = QFileDialog.getSaveFileName(
                self,
                "Save Report",
                "report.pdf",
                "PDF Files (*.pdf)"
            )

            if not path:
                return

            with open(path, "wb") as f:
                f.write(res.content)

            QMessageBox.information(
            self,
            "Downloaded",
            f"Saved at:\n{path}"
            )

        else:
            QMessageBox.warning(
            self,
            "Error",
            "Download Failed"
        )


    # Update Stats
    def update_stats(self, s):

        text = f"""
Total Records: {s['total_records']}
Avg Flowrate: {s['avg_flowrate']:.2f}
Avg Pressure: {s['avg_pressure']:.2f}
Avg Temperature: {s['avg_temperature']:.2f}
"""

        self.stats_label.setText(text)

    
    # Update Chart
    def update_chart(self, dist):

        self.figure.clear()

        ax = self.figure.add_subplot(111)

        names = list(dist.keys())
        values = list(dist.values())

        ax.bar(names, values)

        ax.set_title("Equipment Distribution")

        self.canvas.draw()


    # Logout
    def logout(self):

        self.close()

        self.login = LoginWindow()
        self.login.show()



# Run App
if __name__ == "__main__":

    app = QApplication(sys.argv)

    win = LoginWindow()
    win.show()

    sys.exit(app.exec_())

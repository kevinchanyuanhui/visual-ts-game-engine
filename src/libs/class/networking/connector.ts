
import { IMessageReceived, IUserRegData } from "../../interface/global";
import { UniClick } from "../../types/global";
import { byId, htmlHeader, validateEmail, validatePassword } from "../system";
import EngineConfig from "./../../client-config";

class ConnectorClient {

  protected popupForm: HTMLDivElement;
  private webSocketController;

  constructor(config: EngineConfig) {

    this.popupForm = byId("popup") as HTMLDivElement;

    this.webSocketController = new WebSocket(config.getRemoteServerAddressControlller());
    this.webSocketController.onopen = this.onOpen;
    this.webSocketController.onclose = this.onClose;
    this.webSocketController.onmessage = this.onMessage;
    this.webSocketController.onerror = this.onError;

    if (config.getStartUpHtmlForm() === "register") {
      this.showRegisterForm();
    } else if (config.getStartUpHtmlForm() === "login") {
      this.showLoginForm(null);
    }

  }

  private showRegisterForm = () => {

    const myInstance = this;
    fetch("./templates/register.html", {
      headers: htmlHeader,
    }).
      then(function (res) {
        return res.text();
      }).then(function (html) {
        // console.warn(html);
        myInstance.popupForm.innerHTML = html;
        byId("reg-button").addEventListener("click", myInstance.registerUser, false);
        byId("sing-in-tab").addEventListener("click", myInstance.showLoginForm, false);
      });

  }

  private showLoginForm = (data) => {

    const myInstance = this;
    fetch("./templates/login.html", {
      headers: htmlHeader,
    }).
      then(function (res) {
        return res.text();
      }).then(function (html) {
        // console.warn(html);
        myInstance.popupForm.innerHTML = html;
        byId("login-button").addEventListener("click", myInstance.loginUser, false);
        byId("sing-up-tab").addEventListener("click", myInstance.showRegisterForm, false);
        if (data && data.data && data.data.test) {
          byId("error-msg-login").innerHTML = data.data.text;
        }
      });
  }

  private registerUser = (e: UniClick) => {

    e.preventDefault();

    const localEmail: string = (byId("reg-user") as HTMLInputElement).value;
    const localPassword: string = (byId("reg-pass") as HTMLInputElement).value;

    if (validateEmail(localEmail) !== null) {
      byId("error-msg-reg").style.display = "block";
      byId("error-msg-reg").innerText = validateEmail(localEmail);
    }

    if (validatePassword(localPassword) === false) {
      byId("error-msg-reg").style.display = "block";
      byId("error-msg-reg").innerText += "Password is not valid! length!";
    }

    if (validateEmail(localEmail) === null && validatePassword(localPassword) === true) {

      const userData: IUserRegData = {
        email: localEmail,
        password: localPassword,
      };

      let localMsg = { action: "REGISTER", data: { userRegData: userData } };
      this.sendObject(localMsg);
      localMsg = null;

    }

  }

  private loginUser = (e: UniClick) => {

    e.preventDefault();

    const localEmail: string = (byId("login-user") as HTMLInputElement).value;
    const localPassword: string = (byId("login-pass") as HTMLInputElement).value;

    if (validateEmail(localEmail) !== null) {
      byId("error-msg-login").style.display = "block";
      byId("error-msg-login").innerText = validateEmail(localEmail);
    }

    if (validatePassword(localPassword) === false) {
      byId("error-msg-login").style.display = "block";
      byId("error-msg-login").innerText += "Password is not valid! length!";
    }

    if (validateEmail(localEmail) === null && validatePassword(localPassword) === true) {

      const userData: IUserRegData = {
        email: localEmail,
        password: localPassword,
      };

      let localMsg = { action: "LOGIN", data: { userLoginData: userData } };
      this.sendObject(localMsg);
      localMsg = null;

    }

  }

  private ForgotPassword() {
    console.log("Forgot password !");
  }

  private onOpen = () => {

    console.warn("Session controller connected.");
    this.webSocketController.send(JSON.stringify({ data: "i am here" }));

    const instance = { self: this };
    //this.create
    // createEvent(menuActionEvents.showHome, instance),

  }

  private sendObject = (message) => {

    try {
      message = JSON.stringify(message);
    } catch (err) {
      console.error("Connector.sendObject : ", err);
      return;
    }
    console.warn(message, "<SEND>");

    try {
      this.webSocketController.send(message);
    } catch (e) {
      console.warn("Connector.sendObject (2) : ", e);
    }
  }

  private onClose(evt) {
    alert("Server session is disconnected.Please refresh this page.");
    console.error("Session controller disconnected", evt);
  }

  private onMessage = (evt) => {

    try {
      const dataReceive: IMessageReceived = JSON.parse(evt.data);
      switch (dataReceive.action) {
        case "CHECK_EMAIL":
          {
            this.onMsgCheckEmail(dataReceive);
            break;
          }
        case "VERIFY_SUCCESS":
          {
            this.showLoginForm(dataReceive);
            break;
          }
        case "ONLINE":
          {
            this.showUserAccountProfilePage(dataReceive);
            break;
          }
        case "ERROR_EMAIL":
          {
            (byId("notify") as HTMLInputElement).innerHTML = dataReceive.data.errMsg;
            break;
          }
        default:
          console.log("Connector : dataReceive action : ", dataReceive.action);
      }
    } catch (err) {
      console.error("Connector.onMessage : Error :", err);
    }

  }

  private onError(evt) {
    console.warn("onError" + evt.data);
  }

  private onMsgCheckEmail = (dataReceive) => {

    byId("reg-button").removeEventListener("click", this.registerUser);
    byId("reg-button").addEventListener("click", this.verifyRegistration, false);
    byId("reg-button").innerHTML = "VERIFY CODE";
    byId("reg-pass-label").innerHTML = "Paste Verification code here";
    (byId("reg-pass") as HTMLInputElement).value = "";
    (byId("reg-pass") as HTMLInputElement).placeholder = "Paste Verification code here";
    console.log("TEST", dataReceive.data);
    (byId("notify") as HTMLInputElement).innerHTML = dataReceive.data.text;

  }

  private verifyRegistration = (event: UniClick) => {

    event.preventDefault();

    let localPasswordToken: string = (byId("reg-pass") as HTMLInputElement).value;
    let localEmail: string = (byId("reg-user") as HTMLInputElement).value;
    let localMsg = { action: "REG_VALIDATE", data: { email: localEmail, userRegToken: localPasswordToken } };
    this.sendObject(localMsg);
    localMsg = null;
    localPasswordToken = null;
    localEmail = null;
  }

  private showUserAccountProfilePage = (dataReceive) => {
    // test
    const myInstance = this;
    fetch("./templates/user-profile.html", {
      headers: htmlHeader,
    }).
      then(function (res) {
        return res.text();
      }).then(function (html) {

        myInstance.popupForm.innerHTML = html;
        byId("user-profile-btn-ok").addEventListener("click", myInstance.minimizeUIPanel, false);
        (byId("user-points") as HTMLInputElement).value = dataReceive.data.user.points;
        (byId("user-rank") as HTMLInputElement).value = dataReceive.data.user.rank;
        (byId("user-email") as HTMLInputElement).value = dataReceive.data.user.email;
      });

  }

  private minimizeUIPanel = (e) => {

    e.preventDefault();
    this.popupForm.style.width = "70px";
    this.popupForm.style.height = "25px";

    byId("user-profile-maximaze").style.display = "block";
    byId("user-profile-maximaze").addEventListener("click", this.maximazeUIPanel, false);
    byId("user-profile-form").style.display = "none";
    byId("user-profile-btn-ok").style.display = "none";
  }

  private maximazeUIPanel = (e) => {

    e.preventDefault();
    (this.popupForm as any).style = "";
    byId("user-profile-maximaze").style.display = "none";
    byId("user-profile-maximaze").style.top = "-14px";
    byId("user-profile-maximaze").style.left = "0";
    byId("user-profile-form").style.display = "block";
    byId("user-profile-btn-ok").style.display = "block";

  }

}
export default ConnectorClient;

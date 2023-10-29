const submitButton = document.querySelector(".btn-submit")

let usernameTimeout = null
const usernameInput = document.querySelector("input[name=username]")
const usernameInputFdbck = document.querySelector("#username-feedback")
window.usernameUpdate = function () {
  if (usernameTimeout) clearTimeout(usernameTimeout)

  submitButton.setAttribute("disabled", 1)

  if (usernameInput.value.length > 20) {
    usernameInputFdbck.textContent = "Username must be less than 20 characters"
  }
  else if (usernameInput.value.length < 3) {
    usernameInputFdbck.textContent = "Username must be at least 3 characters long"
  }
  else if (! /^[a-zA-Z0-9_.]+$/.exec(usernameInput.value)) {
    usernameInputFdbck.textContent = "Username must contains only letters, numbers, periods and underscores (_)"
  }
  else {
    usernameInputFdbck.textContent = "Checking avalability..."

    usernameTimeout = setTimeout(async () => {
      const res = await fetch("/oauth/register/check?username=" + encodeURIComponent(usernameInput.value))
        .then((res) => res.json())

      if (res.available) {
        usernameInputFdbck.textContent = "This username is available"
        submitButton.removeAttribute("disabled")
      } else {
        usernameInputFdbck.textContent = "This username is not available"
      }
    }, 1500)
  }
}

// Handle autocomplete
if (usernameInput.value) window.usernameUpdate()

const passwordInput = document.querySelector("input[name=password]")
const passwordInputFdbck = document.querySelector("#password-feedback")
window.passwordUpdate = function () {
  submitButton.setAttribute("disabled", 1)

  if (passwordInput.value.length > 50) {
    passwordInputFdbck.textContent = "Password must be less than 50 characters"
  }
  else if (passwordInput.value.length < 8) {
    passwordInputFdbck.textContent = "Password must be at least 8 characters long"
  }
  else {
    passwordInputFdbck.textContent = ""
    submitButton.removeAttribute("disabled")
  }
}

const passwordConInput = document.querySelector("input[name=password_confirmation]")
const passwordConInputFdbck = document.querySelector("#password_confirmation-feedback")
window.passwordConUpdate = function () {
  submitButton.setAttribute("disabled", 1)

  if (passwordConInput.value != passwordInput.value) {
    passwordConInputFdbck.textContent = "Passwords does not match"
  }
  else {
    passwordConInputFdbck.textContent = ""
    submitButton.removeAttribute("disabled")
  }
}

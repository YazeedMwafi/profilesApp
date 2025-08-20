export async function performLogout(auth) {
  try {
    await auth.removeUser();

    const logoutUrl = new URL(
      "https://eu-central-1efk9hgeww.auth.eu-central-1.amazoncognito.com/logout"
    );
    logoutUrl.searchParams.set("client_id", "64r630o8mhb1qf9i93ls4eu990");
    logoutUrl.searchParams.set("logout_uri", window.location.origin + "/auth");
    if (auth.user?.id_token) {
      logoutUrl.searchParams.set("id_token_hint", auth.user.id_token);
    }

    try {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("justLoggedOut", "1");
    } catch {}

    window.location.href = logoutUrl.toString();
  } catch (error) {
    console.error("Logout failed:", error);
    window.location.href = "/auth";
  }
}



using API.Dtos.Google;
using API.Interfaces;
using System.Text;


namespace API.Services
{
    public sealed class GoogleService : IGoogleService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public GoogleService(IConfiguration config)
        {
            _httpClient = new HttpClient();
            _config = config;
        }
        public string GetCallbackUrl()
        {
            try
            {
                string scopeURL1 = "https://accounts.google.com/o/oauth2/auth?redirect_uri={0}&prompt={1}&response_type={2}&client_id={3}&scope={4}&access_type={5}";
                string? redirectURL = _config["Google:RedirectUri"];

                if (string.IsNullOrEmpty(redirectURL))
                {
                    throw new Exception("Redirect URL is not configured.");
                }
                string prompt = "consent";
                string response_type = "code";
                string clientID = _config["Google:ClientId"] ?? "";
                string scope = "https://www.googleapis.com/auth/calendar openid profile email";
                string access_type = "offline";
                string redirect_uri_encode = _UrlEncodeForGoogle(redirectURL);
                string? mainURL = string.Format(scopeURL1, redirect_uri_encode, prompt, response_type, clientID, scope, access_type);

                return mainURL;
            }
            catch (Exception ex)
            {
                return ex.ToString();
            }
        }
        public async Task<GoogleUserInfoDTO?> GetGoogleUserInfoAsync(string accessToken)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v2/userinfo");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return Newtonsoft.Json.JsonConvert.DeserializeObject<GoogleUserInfoDTO>(content)!;
            }
            else
            {
                throw new Exception($"Failed to fetch user info: {response.StatusCode}");
            }
        }
        public async Task<GoogleAuthResponseDTO?> GetGoogleAuthResponseAsync(string code)
        {

            var clientId = _config["Google:ClientId"] ?? "";
            string clientSecret = _config["Google:ClientSecret"] ?? "";
            var redirectURL = _config["Google:RedirectUri"] ?? "";
            var tokenEndpoint = "https://accounts.google.com/o/oauth2/token";
            var content = new StringContent($"code={code}&redirect_uri={Uri.EscapeDataString(redirectURL)}&client_id={clientId}&client_secret={clientSecret}&grant_type=authorization_code", Encoding.UTF8, "application/x-www-form-urlencoded");

            var response = await _httpClient.PostAsync(tokenEndpoint, content);
            var responseContent = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                GoogleAuthResponseDTO? tokenResponse = Newtonsoft.Json.JsonConvert.DeserializeObject<GoogleAuthResponseDTO>(responseContent)
                 ?? throw new Exception("Failed to deserialize token response.");

                return tokenResponse;
            }
            else
            {
                throw new Exception($"Failed to authenticate: {responseContent}");
            }
        }

        private static string _UrlEncodeForGoogle(string url)
        {
            string unreservedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.~";
            StringBuilder result = new();
            foreach (char symbol in url)
            {
                if (unreservedChars.Contains(symbol))
                {
                    result.Append(symbol);
                }
                else
                {
                    result.Append("%" + ((int)symbol).ToString("X2"));
                }
            }

            return result.ToString();

        }
    }

}
namespace API.Enums
{
    using System.Text.Json.Serialization;

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum PasswordStrengthEnum
    {
        Weak,
        Medium,
        Strong,
        VeryStrong
    }
}
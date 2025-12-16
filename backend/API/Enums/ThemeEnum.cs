namespace API.Enums
{
    using System.Text.Json.Serialization;

    [JsonConverter(typeof(JsonStringEnumConverter))]

    public enum ThemeEnum
    {
        light,
        dark,
        system
    }
}
import Principal "mo:core/Principal";

module {
  /// A user identity (Internet Identity principal).
  public type UserId = Principal;

  /// A calendar day encoded as YYYYMMDD (e.g. 20261007).
  public type DayKey = Nat;

  /// A timestamp in nanoseconds since the Unix epoch.
  public type Timestamp = Int;

  /// The three supported Indonesian marketplaces.
  public type Platform = {
    #shopee;
    #tiktokShop;
    #lazada;
  };

  /// Thematic grouping for daily tips.
  public type TipTheme = {
    #listing;
    #konten;
    #promosi;
    #layananPelanggan;
    #analisisData;
  };
};

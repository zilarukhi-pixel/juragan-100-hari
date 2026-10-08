import Common "common";

module {
  /// A single daily selling tip.
  public type Tip = {
    id : Nat;
    day : Common.DayKey;
    title : Text;
    summary : Text;
    actionStep : Text;
    platform : Common.Platform;
    theme : Common.TipTheme;
  };

  /// A tip as returned to the frontend, including the caller's own state.
  public type TipView = {
    id : Nat;
    day : Common.DayKey;
    title : Text;
    summary : Text;
    actionStep : Text;
    platform : Common.Platform;
    theme : Common.TipTheme;
    done : Bool;
    favorite : Bool;
  };
};

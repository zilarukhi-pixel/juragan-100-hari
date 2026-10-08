import Common "common";

module {
  /// A single multiple-choice question in the daily quiz.
  public type QuizQuestion = {
    id : Nat;
    day : Common.DayKey;
    prompt : Text;
    options : [Text];
    correctIndex : Nat;
    explanation : Text;
  };

  /// A question as shown to the player (correct answer withheld).
  public type QuizQuestionView = {
    id : Nat;
    prompt : Text;
    options : [Text];
  };

  /// The caller's stored result for one day's quiz.
  public type QuizResult = {
    day : Common.DayKey;
    score : Nat;
    total : Nat;
    points : Nat;
    completedAt : Common.Timestamp;
  };

  /// Per-question feedback returned after submitting the quiz.
  public type QuizAnswerFeedback = {
    questionId : Nat;
    chosenIndex : Nat;
    correctIndex : Nat;
    correct : Bool;
    explanation : Text;
  };

  /// The full outcome of submitting a day's quiz.
  public type QuizSubmission = {
    day : Common.DayKey;
    score : Nat;
    total : Nat;
    points : Nat;
    feedback : [QuizAnswerFeedback];
  };
};

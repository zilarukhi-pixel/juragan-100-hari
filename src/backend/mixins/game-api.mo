import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Common "../types/common";
import Types "../types/game";
import GameLib "../lib/game";
import Day "../lib/day";

mixin (
  questions : Map.Map<Nat, Types.QuizQuestion>,
  results : Map.Map<Principal, Map.Map<Nat, Types.QuizResult>>,
) {
  /// Return today's quiz questions (correct answers withheld).
  public query ({ caller }) func getTodayQuiz() : async [Types.QuizQuestionView] {
    ignore caller;
    GameLib.getTodayQuiz(questions, Day.today());
  };

  /// Submit the caller's answers for today's quiz.
  public shared ({ caller }) func submitQuiz(answers : [(Nat, Nat)]) : async Types.QuizSubmission {
    GameLib.submitQuiz(questions, results, caller, Day.today(), answers, Time.now());
  };

  /// Return the caller's quiz result for a given day, if played.
  public query ({ caller }) func getQuizResult(day : Common.DayKey) : async ?Types.QuizResult {
    GameLib.getResult(results, caller, day);
  };

  /// Return the caller's quiz history, newest first.
  public query ({ caller }) func listQuizHistory() : async [Types.QuizResult] {
    GameLib.listHistory(results, caller);
  };
};

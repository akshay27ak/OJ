import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Code, Trash, Plus, Sparkles } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const UpdateProblemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "" }]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/problems/${id}`);
        const data = await res.json();

        if (!res.ok || !data) throw new Error("Problem not found");

        if (user && data.createdBy?._id !== user._id) {
          toast({ title: "Unauthorized", variant: "destructive" });
          navigate("/dashboard");
          return;
        }

        setTitle(data.title);
        setStatement(data.statement);
        setDifficulty(data.difficulty);
        setTestCases(data.testCases || [{ input: "", expectedOutput: "" }]);
      } catch (err) {
        toast({ title: "Problem not found", variant: "destructive" });
        navigate("/dashboard");
      }
    };

    if (id) fetchProblem();
  }, [id, user, navigate, toast]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/problems/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, statement, difficulty, testCases }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast({ title: "Problem Updated Successfully" });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestCaseChange = (index: number, field: "input" | "expectedOutput", value: string) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "" }]);
  };

  const removeTestCase = (index: number) => {
    const updated = [...testCases];
    updated.splice(index, 1);
    setTestCases(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-pink-100 to-blue-100 relative overflow-hidden">
      {/* Glowing Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-2/3 right-1/3 w-80 h-80 bg-pink-300/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/2 w-64 h-64 bg-blue-300/20 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* ✅ Absolute "Back to Dashboard" */}
      <Link
        to="/dashboard"
        className="absolute top-6 left-6 z-30 flex items-center space-x-2 text-black hover:text-purple-600 text-lg font-semibold transition-colors duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 pt-32 pb-8">
        <div className="relative z-10 w-full max-w-4xl animate-fade-in-up">
          <Card className="bg-white border border-purple-200 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <Code className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl text-black font-bold">
                Update Problem
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-6 py-2">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="title" className="text-black text-lg">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-gradient-to-r from-blue-100 to-purple-100 text-black h-12 text-lg"
                    placeholder="Enter problem title"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="statement" className="text-black text-lg">Statement</Label>
                  <Textarea
                    id="statement"
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    required
                    className="bg-gradient-to-r from-blue-100 to-purple-100 text-black h-40 text-sm"
                    placeholder="Enter problem description"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="difficulty" className="text-black text-lg">Difficulty</Label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="bg-gradient-to-r from-blue-100 to-purple-100 text-black h-12 w-full text-lg rounded px-4"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>

                {/* Test Cases */}
                <div className="space-y-3">
                  <Label className="text-black text-lg">Test Cases</Label>
                  <Label className="text-sm text-gray-600 italic">
                    (First test case will be visible to the solver)
                  </Label>

                  {testCases.map((tc, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded space-y-1 relative border border-white/20">
                      <Label className="text-black">Input (#{index + 1})</Label>
                      <Textarea
                        className="bg-white text-black h-20 text-sm"
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                        placeholder="Input"
                        required
                      />
                      <Label className="text-black">Expected Output</Label>
                      <Textarea
                        className="bg-white text-black h-20 text-sm"
                        value={tc.expectedOutput}
                        onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)}
                        placeholder="Expected Output"
                        required
                      />
                      {testCases.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          variant="destructive"
                          className="absolute top-2 right-2"
                        >
                          <Trash size={16} />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={addTestCase}
                    className="bg-blue-200 text-black font-semibold hover:bg-blue-300 shadow-md hover:scale-105 transition-all"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Test Case
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-400 to-cyan-500 text-white font-semibold h-12 text-lg transition-all duration-300 hover:scale-105"
                >
                  {isLoading ? "Updating..." : (
                    <div className="flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Update Problem
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-sm text-white py-6 bg-black border-t border-white/10 z-10">
        © {new Date().getFullYear()} Beyond code. 🚀 A mindset for better thinking.
      </footer>
    </div>
  );
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Welcome back! 🎉");
      } else {
        if (!name.trim() || !age || !studentClass.trim()) {
          toast.error("Please fill in all fields!");
          setLoading(false);
          return;
        }
        await signUp(email, password, { name: name.trim(), age: parseInt(age), class: studentClass.trim() });
        toast.success("Account created! Welcome! 🌟");
      }
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            className="text-7xl mb-4"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            😊
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-foreground">
            Emotion Explorer
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Learn about feelings! 🌈
          </p>
        </div>

        <div className="card-playful p-6">
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={isLogin ? "default" : "outline"}
              className="flex-1 text-lg rounded-xl h-12 font-display"
              onClick={() => setIsLogin(true)}
            >
              Login
            </Button>
            <Button
              type="button"
              variant={!isLogin ? "default" : "outline"}
              className="flex-1 text-lg rounded-xl h-12 font-display"
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  placeholder="Your Name 🧒"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-lg rounded-xl"
                  required
                  maxLength={50}
                />
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-12 text-lg rounded-xl flex-1"
                    min={5}
                    max={15}
                    required
                  />
                  <Input
                    placeholder="Class (e.g. 3A)"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="h-12 text-lg rounded-xl flex-1"
                    required
                    maxLength={10}
                  />
                </div>
              </>
            )}
            <Input
              type="email"
              placeholder="Email 📧"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-lg rounded-xl"
              required
            />
            <Input
              type="password"
              placeholder="Password 🔒"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-lg rounded-xl"
              required
              minLength={6}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-xl rounded-xl font-display"
            >
              {loading ? "Loading..." : isLogin ? "Let's Go! 🚀" : "Create Account ✨"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

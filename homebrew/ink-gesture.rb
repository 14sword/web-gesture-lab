class InkGesture < Formula
  desc "Ink Gesture Web Interaction Lab (MediaPipe Hand Tracking)"
  homepage "https://github.com/14sword/web-gesture-lab"
  url "https://github.com/14sword/web-gesture-lab.git", branch: "main"
  version "1.0.0"

  depends_on "python"

  def install
    # Copy project files to libexec
    libexec.install Dir["*"]
    
    # Create bin runner script
    (bin/"ink-gesture").write <<~EOS
      #!/bin/bash
      exec "#{libexec}/homebrew/ink-gesture-launcher.sh" "$@"
    EOS
    chmod 0755, bin/"ink-gesture"
  end

  test do
    assert_match "Ink Gesture", shell_output("#{bin}/ink-gesture --help", 1)
  end
end

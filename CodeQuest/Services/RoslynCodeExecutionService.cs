using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using System.Reflection;
using System.Text;

namespace CodeQuest.Services;

public class RoslynCodeExecutionService
{
    public async Task<string> ExecuteAsync(string code)
    {
        try
        {
            var syntaxTree = CSharpSyntaxTree.ParseText(code, new CSharpParseOptions(LanguageVersion.Preview));
            var references = GetDefaultReferences();

            var compilation = CSharpCompilation.Create(
                "CodeQuestUserProgram",
                new[] { syntaxTree },
                references,
                new CSharpCompilationOptions(OutputKind.ConsoleApplication)
                    .WithOptimizationLevel(OptimizationLevel.Release)
                    .WithNullableContextOptions(NullableContextOptions.Enable)
            );

            using var peStream = new MemoryStream();
            var emitResult = compilation.Emit(peStream);
            if (!emitResult.Success)
            {
                var errors = emitResult.Diagnostics
                    .Where(d => d.Severity == DiagnosticSeverity.Error)
                    .Select(d => d.ToString());
                return string.Join(Environment.NewLine, errors);
            }

            peStream.Seek(0, SeekOrigin.Begin);
            var asm = Assembly.Load(peStream.ToArray());

            var originalOut = Console.Out;
            var outputWriter = new StringWriter(new StringBuilder());
            Console.SetOut(outputWriter);
            try
            {
                var entry = asm.EntryPoint;
                if (entry == null) return "No entry point found.";
                var hasArgs = entry.GetParameters().Length == 1;
                var parameters = hasArgs ? new object[] { Array.Empty<string>() } : null;
                var result = entry.Invoke(null, parameters);
                if (result is Task task) await task;
                return outputWriter.ToString();
            }
            catch (TargetInvocationException tie)
            {
                return $"Runtime Error: {tie.InnerException?.Message ?? tie.Message}";
            }
            catch (Exception ex)
            {
                return $"Runtime Error: {ex.Message}";
            }
            finally
            {
                Console.SetOut(originalOut);
            }
        }
        catch (Exception ex)
        {
            return $"Runtime Error: {ex.Message}";
        }
    }

    static IEnumerable<MetadataReference> GetDefaultReferences()
    {
        var refs = new List<MetadataReference>();
        void add(Assembly asm)
        {
            var loc = asm.Location;
            if (!string.IsNullOrWhiteSpace(loc) && File.Exists(loc))
                refs.Add(MetadataReference.CreateFromFile(loc));
        }

        add(typeof(object).Assembly);
        add(typeof(Console).Assembly);
        add(typeof(Enumerable).Assembly);
        add(typeof(List<>).Assembly);
        add(typeof(StringBuilder).Assembly);
        add(typeof(Task).Assembly);

        var tpa = (AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES") as string)?.Split(Path.PathSeparator) ?? Array.Empty<string>();
        string[] names = new[]
        {
            "System.Private.CoreLib",
            "System.Runtime",
            "System.Console",
            "System.Linq",
            "System.Collections",
            "System.Text",
            "System.IO",
            "netstandard"
        };
        foreach (var p in tpa)
        {
            var file = Path.GetFileName(p);
            if (names.Any(n => file.StartsWith(n, StringComparison.OrdinalIgnoreCase)))
            {
                refs.Add(MetadataReference.CreateFromFile(p));
            }
        }
        return refs;
    }
}

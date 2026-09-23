import React, { useEffect, useState } from "react";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
export default function SystemDesignLLD() {
  // Set VITE_BASE_URL in your frontend .env to your backend origin.
  // Example: VITE_BASE_URL=https://target-trek.onrender.com
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

  const supportEmail = "supporttargettrek@gmail.com";

  const [language, setLanguage] = useState("Java");
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");

    
        const redirectUrl = window.location.pathname;

        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
            redirectUrl
          )}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(
            result?.error?.message || "Book not found."
          );
        }

        setProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;

        console.error("Failed to fetch product:", error);
        setProduct(null);
        setProductError(
          error?.message || "Book not found."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProduct(false);
        }
      }
    };

    fetchProduct();

    return () => controller.abort();
  }, [BASE_URL]);

  const currentPrice = Number(product?.price ?? 0);
  const mrp = Number(product?.mrp ?? 0);
  const currency = product?.currency || "INR";

  const discount =
    mrp > 0 && currentPrice >= 0 && mrp > currentPrice
      ? Math.round(((mrp - currentPrice) / mrp) * 100)
      : 0;

  const formatMoney = (amount) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(amount || 0));
    } catch {
      return `₹${Number(amount || 0)}`;
    }
  };

  const handleBuyNow = () => {
    if (!product?._id) return;
    setCheckoutOpen(true);
  };

  if (loadingProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <h1 className="mt-6 text-xl font-black text-slate-950">
            Loading book...
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please wait while we load the product details.
          </p>
        </div>
      </div>
    );
  }

  if (!product || productError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            📚
          </div>

          <h1 className="mt-6 text-2xl font-black text-slate-950 sm:text-3xl">
            Book not found
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500 sm:text-base">
            We could not find this book, or it may no longer be available.
            Please return to the books page and choose another resource.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/books";
            }}
            className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-blue-700 sm:w-auto"
          >
            ← Return to Books
          </button>
        </div>
      </div>
    );
  }

  const patterns = {
    Creational: [
      {
        name: "Singleton",
        purpose:
          "Ensures that a class has only one instance and provides a controlled access point.",
        example: "Logger, Configuration Manager, Cache Manager",
        when: "When exactly one shared instance is required."
      },
      {
        name: "Factory Method",
        purpose:
          "Creates objects without exposing the exact object creation logic to the client.",
        example: "Notification Factory, Payment Factory",
        when: "When object creation depends on runtime input."
      },
      {
        name: "Abstract Factory",
        purpose:
          "Creates families of related objects without specifying their concrete classes.",
        example: "UI components, payment provider families",
        when: "When multiple related products must work together."
      },
      {
        name: "Builder",
        purpose:
          "Constructs complex objects step by step.",
        example: "User, Car, HTTP Request, Pizza",
        when: "When an object has many optional parameters."
      },
      {
        name: "Prototype",
        purpose:
          "Creates new objects by copying an existing object.",
        example: "Document templates, game objects",
        when: "When object creation is expensive or cloning is convenient."
      }
    ],

    Structural: [
      {
        name: "Adapter",
        purpose:
          "Allows incompatible interfaces to work together.",
        example: "Third-party payment SDK adapter",
        when: "When an existing API does not match your application's interface."
      },
      {
        name: "Bridge",
        purpose:
          "Separates abstraction from implementation so both can evolve independently.",
        example: "Notification type + delivery channel",
        when: "When two dimensions of a system change independently."
      },
      {
        name: "Composite",
        purpose:
          "Treats individual objects and compositions of objects uniformly.",
        example: "File and Folder hierarchy",
        when: "When you have tree-like structures."
      },
      {
        name: "Decorator",
        purpose:
          "Adds behavior dynamically without modifying the original class.",
        example: "Coffee toppings, logging, authorization",
        when: "When functionality needs to be layered dynamically."
      },
      {
        name: "Facade",
        purpose:
          "Provides a simple interface over a complex subsystem.",
        example: "Order processing service",
        when: "When clients should not know subsystem complexity."
      },
      {
        name: "Flyweight",
        purpose:
          "Shares common immutable state to reduce memory usage.",
        example: "Game objects, character rendering",
        when: "When thousands of similar objects exist."
      },
      {
        name: "Proxy",
        purpose:
          "Provides a substitute or controlled access to another object.",
        example: "Caching proxy, authorization proxy",
        when: "When access needs to be controlled or enhanced."
      }
    ],

    Behavioral: [
      {
        name: "Chain of Responsibility",
        purpose:
          "Passes a request through a chain of handlers.",
        example: "Authentication → Authorization → Validation",
        when: "When multiple handlers may process a request."
      },
      {
        name: "Command",
        purpose:
          "Encapsulates a request as an object.",
        example: "Undo/redo, remote commands",
        when: "When operations need to be queued, logged or undone."
      },
      {
        name: "Interpreter",
        purpose:
          "Defines a representation and interpreter for a language or grammar.",
        example: "Rule engines, expression evaluators",
        when: "When a simple domain-specific language is required."
      },
      {
        name: "Iterator",
        purpose:
          "Provides sequential access to elements without exposing collection internals.",
        example: "Custom collection traversal",
        when: "When collections need standardized traversal."
      },
      {
        name: "Mediator",
        purpose:
          "Centralizes communication between multiple objects.",
        example: "Chat room, air traffic control",
        when: "When many objects communicate directly and become tightly coupled."
      },
      {
        name: "Memento",
        purpose:
          "Captures and restores an object's previous state.",
        example: "Undo functionality",
        when: "When object state needs checkpointing."
      },
      {
        name: "Observer",
        purpose:
          "Notifies dependent objects when state changes.",
        example: "Notification system, stock updates",
        when: "When multiple subscribers depend on an event."
      },
      {
        name: "State",
        purpose:
          "Changes object behavior when its internal state changes.",
        example: "Vending machine, order lifecycle",
        when: "When behavior varies significantly by state."
      },
      {
        name: "Strategy",
        purpose:
          "Encapsulates interchangeable algorithms behind a common interface.",
        example: "Payment methods, coupon strategies",
        when: "When an algorithm can vary independently."
      },
      {
        name: "Template Method",
        purpose:
          "Defines the skeleton of an algorithm while allowing subclasses to customize steps.",
        example: "Payment processing workflow",
        when: "When workflows share common steps."
      },
      {
        name: "Visitor",
        purpose:
          "Adds operations to object structures without modifying their classes.",
        example: "Document processing, AST operations",
        when: "When many operations must be performed over a stable object structure."
      }
    ]
  };

  const designQuestions = [
    {
      company: "BookMyShow",
      title: "Movie Ticket Booking",
      focus: "Concurrency + Seat Locking",
      patterns: ["State", "Strategy", "Observer"],
      thought:
        "How do you prevent two users from successfully booking the same seat?",
      classes:
        "Movie, Theatre, Screen, Show, Seat, Booking, Payment, User"
    },
    {
      company: "Zepto",
      title: "Inventory Management",
      focus: "Inventory + concurrency",
      patterns: ["Strategy", "Observer", "Factory Method"],
      thought:
        "How do you reserve stock while multiple orders are being processed?",
      classes:
        "Product, Inventory, Warehouse, StockItem, Order, Reservation"
    },
    {
      company: "Parking System",
      title: "Parking Lot",
      focus: "Object modeling + pricing",
      patterns: ["Strategy", "Factory Method", "State"],
      thought:
        "How do different vehicle types find slots and calculate parking fees?",
      classes:
        "ParkingLot, Floor, Spot, Vehicle, Ticket, PricingStrategy"
    },
    {
      company: "Notification Platform",
      title: "Notification System",
      focus: "Multiple channels",
      patterns: ["Factory", "Strategy", "Observer"],
      thought:
        "How can Email, SMS, Push and WhatsApp be added without modifying existing business logic?",
      classes:
        "Notification, Channel, Template, UserPreference, NotificationService"
    },
    {
      company: "API Platform",
      title: "Rate Limiter",
      focus: "Algorithms + thread safety",
      patterns: ["Strategy", "Factory Method"],
      thought:
        "How would you support Fixed Window, Sliding Window and Token Bucket?",
      classes:
        "RateLimiter, Algorithm, TokenBucket, SlidingWindow, Client"
    },
    {
      company: "Logging Platform",
      title: "Logger",
      focus: "Thread safety + extensibility",
      patterns: ["Singleton", "Chain of Responsibility", "Strategy"],
      thought:
        "How can multiple log levels and output destinations be supported cleanly?",
      classes:
        "Logger, LogLevel, LogHandler, ConsoleAppender, FileAppender"
    },
    {
      company: "IRCTC",
      title: "Train Reservation System",
      focus: "Booking + state transitions",
      patterns: ["State", "Strategy", "Observer"],
      thought:
        "How do train availability, booking status and cancellation rules evolve?",
      classes:
        "Train, Station, Route, Coach, Seat, Passenger, Booking"
    },
    {
      company: "Zoomcar",
      title: "Car Rental System",
      focus: "Vehicle availability + pricing",
      patterns: ["Strategy", "State", "Factory"],
      thought:
        "How would you model vehicle availability, pricing and different vehicle types?",
      classes:
        "Vehicle, Car, Customer, Rental, Location, PricingStrategy"
    },
    {
      company: "Splitwise",
      title: "Expense Sharing",
      focus: "Strategy + domain modeling",
      patterns: ["Strategy", "Factory Method"],
      thought:
        "How can Equal, Exact and Percentage split strategies coexist?",
      classes:
        "User, Expense, Split, Group, Balance, SplitStrategy"
    },
    {
      company: "Cricbuzz",
      title: "Live Cricket Score",
      focus: "Real-time updates",
      patterns: ["Observer", "State", "Strategy"],
      thought:
        "How should thousands of subscribers receive score updates?",
      classes:
        "Match, Innings, Ball, Score, Subscriber, ScoreBoard"
    },
    {
      company: "Coupon Engine",
      title: "Coupon Application",
      focus: "Business rules",
      patterns: ["Strategy", "Chain of Responsibility", "Factory"],
      thought:
        "How do you support percentage discounts, flat discounts and conditional coupons?",
      classes:
        "Coupon, Cart, DiscountStrategy, EligibilityRule, CouponService"
    },
    {
      company: "Uber",
      title: "Ride Booking",
      focus: "Matching + pricing",
      patterns: ["Strategy", "Observer", "State"],
      thought:
        "How can driver matching and surge pricing change independently?",
      classes:
        "Rider, Driver, Ride, Location, PricingStrategy, MatchingStrategy"
    },
    {
      company: "Payment Platform",
      title: "Payment Gateway",
      focus: "Multiple providers",
      patterns: ["Adapter", "Factory", "Strategy"],
      thought:
        "How can Razorpay, Stripe, PayPal or another provider be plugged in behind one interface?",
      classes:
        "Payment, PaymentGateway, PaymentProvider, Transaction, PaymentFactory"
    },
    {
      company: "Video Conferencing",
      title: "Zoom-like Meeting System",
      focus: "Meeting lifecycle",
      patterns: ["State", "Observer", "Mediator"],
      thought:
        "How should participants, chat, meeting state and notifications communicate?",
      classes:
        "Meeting, Participant, Host, Room, Chat, MeetingState"
    },
    {
      company: "E-commerce",
      title: "Order Management",
      focus: "Order lifecycle",
      patterns: ["State", "Observer", "Command"],
      thought:
        "How should an order move through created, paid, packed, shipped and delivered states?",
      classes:
        "Order, OrderItem, Payment, Shipment, OrderState, Notification"
    },
    {
      company: "Food Delivery",
      title: "Food Delivery System",
      focus: "Dispatch + pricing",
      patterns: ["Strategy", "Observer", "State"],
      thought:
        "How do restaurants, customers and delivery partners coordinate?",
      classes:
        "Restaurant, Menu, Order, DeliveryPartner, DispatchStrategy"
    }
  ];

  const codeExamples = {
    Java: {
      Factory: `interface Payment {
    void pay(double amount);
}

class CardPayment implements Payment {
    public void pay(double amount) {
        System.out.println("Card: " + amount);
    }
}

class PaymentFactory {
    static Payment create(String type) {
        if (type.equals("CARD"))
            return new CardPayment();

        throw new IllegalArgumentException("Unknown type");
    }
}

Payment payment = PaymentFactory.create("CARD");
payment.pay(999);`,
      Strategy: `interface PricingStrategy {
    double calculate(double amount);
}

class NormalPricing implements PricingStrategy {
    public double calculate(double amount) {
        return amount;
    }
}

class DiscountPricing implements PricingStrategy {
    public double calculate(double amount) {
        return amount * 0.9;
    }
}

class Order {
    private PricingStrategy strategy;

    Order(PricingStrategy strategy) {
        this.strategy = strategy;
    }

    double getPrice(double amount) {
        return strategy.calculate(amount);
    }
}`,
      Observer: `interface Observer {
    void update(String message);
}

class User implements Observer {
    public void update(String message) {
        System.out.println(message);
    }
}

class NotificationService {
    private List<Observer> users = new ArrayList<>();

    void subscribe(Observer user) {
        users.add(user);
    }

    void notifyUsers(String message) {
        for (Observer user : users)
            user.update(message);
    }
}`,
      Builder: `class User {
    private String name;
    private String email;
    private int age;

    static class Builder {
        private String name;
        private String email;
        private int age;

        Builder name(String value) {
            name = value;
            return this;
        }

        Builder email(String value) {
            email = value;
            return this;
        }

        Builder age(int value) {
            age = value;
            return this;
        }

        User build() {
            User user = new User();
            user.name = name;
            user.email = email;
            user.age = age;
            return user;
        }
    }
}`,
      Locking: `class Inventory {
    private final Object lock = new Object();
    private int stock = 10;

    boolean reserve(int quantity) {
        synchronized (lock) {
            if (stock < quantity)
                return false;

            stock -= quantity;
            return true;
        }
    }
}`
    },

    "C++": {
      Factory: `class Payment {
public:
    virtual void pay(double amount) = 0;
    virtual ~Payment() = default;
};

class CardPayment : public Payment {
public:
    void pay(double amount) override {
        cout << "Card: " << amount;
    }
};

class PaymentFactory {
public:
    static unique_ptr<Payment> create(string type) {
        if (type == "CARD")
            return make_unique<CardPayment>();

        throw invalid_argument("Unknown type");
    }
};

auto payment = PaymentFactory::create("CARD");
payment->pay(999);`,
      Strategy: `class PricingStrategy {
public:
    virtual double calculate(double amount) = 0;
    virtual ~PricingStrategy() = default;
};

class DiscountPricing : public PricingStrategy {
public:
    double calculate(double amount) override {
        return amount * 0.9;
    }
};

class Order {
    unique_ptr<PricingStrategy> strategy;

public:
    Order(unique_ptr<PricingStrategy> s)
        : strategy(move(s)) {}

    double price(double amount) {
        return strategy->calculate(amount);
    }
};`,
      Observer: `class Observer {
public:
    virtual void update(string message) = 0;
};

class NotificationService {
    vector<Observer*> observers;

public:
    void subscribe(Observer* observer) {
        observers.push_back(observer);
    }

    void notify(string message) {
        for (auto observer : observers)
            observer->update(message);
    }
};`,
      Builder: `class User {
public:
    string name;
    string email;
    int age;

    class Builder {
        User user;

    public:
        Builder& name(string value) {
            user.name = value;
            return *this;
        }

        Builder& email(string value) {
            user.email = value;
            return *this;
        }

        Builder& age(int value) {
            user.age = value;
            return *this;
        }

        User build() {
            return user;
        }
    };
};`,
      Locking: `class Inventory {
    mutex m;
    int stock = 10;

public:
    bool reserve(int quantity) {
        lock_guard<mutex> lock(m);

        if (stock < quantity)
            return false;

        stock -= quantity;
        return true;
    }
};`
    },

    Python: {
      Factory: `from abc import ABC, abstractmethod

class Payment(ABC):
    @abstractmethod
    def pay(self, amount):
        pass

class CardPayment(Payment):
    def pay(self, amount):
        print("Card:", amount)

class PaymentFactory:
    @staticmethod
    def create(payment_type):
        if payment_type == "CARD":
            return CardPayment()

        raise ValueError("Unknown type")

payment = PaymentFactory.create("CARD")
payment.pay(999)`,
      Strategy: `class NormalPricing:
    def calculate(self, amount):
        return amount

class DiscountPricing:
    def calculate(self, amount):
        return amount * 0.9

class Order:
    def __init__(self, strategy):
        self.strategy = strategy

    def price(self, amount):
        return self.strategy.calculate(amount)

order = Order(DiscountPricing())
print(order.price(1000))`,
      Observer: `class NotificationService:
    def __init__(self):
        self.subscribers = []

    def subscribe(self, subscriber):
        self.subscribers.append(subscriber)

    def notify(self, message):
        for subscriber in self.subscribers:
            subscriber.update(message)

class User:
    def update(self, message):
        print(message)`,
      Builder: `class User:
    def __init__(self, name, email, age):
        self.name = name
        self.email = email
        self.age = age

class UserBuilder:
    def __init__(self):
        self.name = None
        self.email = None
        self.age = None

    def name_value(self, value):
        self.name = value
        return self

    def email_value(self, value):
        self.email = value
        return self

    def age_value(self, value):
        self.age = value
        return self

    def build(self):
        return User(self.name, self.email, self.age)`,
      Locking: `import threading

class Inventory:
    def __init__(self):
        self.stock = 10
        self.lock = threading.Lock()

    def reserve(self, quantity):
        with self.lock:
            if self.stock < quantity:
                return False

            self.stock -= quantity
            return True`
    }
  };

  const codeTabs = [
    ["Factory", "Factory Pattern"],
    ["Strategy", "Strategy Pattern"],
    ["Observer", "Observer Pattern"],
    ["Builder", "Builder Pattern"],
    ["Locking", "Thread-Safe Locking"]
  ];

  const principles = [
    {
      title: "Single Responsibility",
      short: "One class should have one reason to change."
    },
    {
      title: "Open / Closed",
      short: "Open for extension, closed for modification."
    },
    {
      title: "Liskov Substitution",
      short: "Subtypes should remain substitutable for their base types."
    },
    {
      title: "Interface Segregation",
      short: "Prefer focused interfaces over large interfaces."
    },
    {
      title: "Dependency Inversion",
      short: "High-level logic should depend on abstractions."
    },
    {
      title: "KISS",
      short: "Keep the design simple unless complexity provides real value."
    },
    {
      title: "DRY",
      short: "Avoid duplicating business logic and knowledge."
    },
    {
      title: "YAGNI",
      short: "Do not build functionality before there is a real requirement."
    },
    {
      title: "Composition over Inheritance",
      short: "Prefer composing behavior when inheritance creates unnecessary coupling."
    },
    {
      title: "Program to Interfaces",
      short: "Depend on contracts rather than concrete implementations."
    },
    {
      title: "High Cohesion",
      short: "Keep closely related responsibilities together."
    },
    {
      title: "Low Coupling",
      short: "Minimize unnecessary dependencies between components."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900">

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">

          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">

            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                <span>🔥</span>
                Complete Low-Level Design Interview Guide
              </div>

              <h1 className="max-w-5xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Mastering System Design
                <span className="block text-blue-600">
                   Low-Level Design
                </span>
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                Go from{" "}
                <strong className="text-slate-900">
                  OOP fundamentals
                </strong>{" "}
                to designing real-world production-style systems using
                SOLID principles, design patterns, concurrency, locking,
                clean architecture and interview-focused design thinking.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  "OOP",
                  "SOLID",
                  "23 Design Patterns",
                  "Concurrency",
                  "Locking",
                  "15+ LLD Problems",
                  "Java",
                  "C++",
                  "Python"
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap gap-4">
                <button
                  onClick={handleBuyNow}
                  disabled={!product?._id}
                  className="rounded-xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                  Get the LLD Ebook →
                </button>

                <a
                  href="#inside"
                  className="rounded-xl border border-slate-300 bg-white px-7 py-4 font-bold text-slate-800 transition hover:bg-slate-50"
                >
                  Explore What's Inside
                </a>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-500 sm:flex sm:flex-wrap sm:gap-5 sm:text-sm">
                <span>✓ Beginner Friendly</span>
                <span>✓ Interview Focused</span>
                <span>✓ Code First</span>
                <span>✓ Digital PDF</span>
              </div>
            </div>

            {/* PRICE CARD */}
            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/40 sm:p-7">

              <div className="rounded-2xl bg-blue-50 p-5">
                <div className="flex items-center justify-between">
                  {discount > 0 && (
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                    {discount}% OFF
                  </span>
                  )}

                  <span className="text-sm font-semibold text-blue-700">
                    Limited-Time Deal
                  </span>
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-950">
                  Mastering System Design – LLD
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  A practical guide to object-oriented design, design
                  patterns, concurrency and real-world LLD interviews.
                </p>

                <div className="mt-6 flex items-end gap-3">
                  <span className="text-4xl font-black text-slate-950">
                    {formatMoney(currentPrice)}
                  </span>

                  {mrp > currentPrice && (
                  <span className="pb-1 text-lg text-slate-400 line-through">
                    {formatMoney(mrp)}
                  </span>
                  )}
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={!product?._id}
                  className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                  Buy the Ebook
                </button>

                <p className="mt-3 text-center text-xs text-slate-500">
                  Secure digital purchase • Instant access
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["23", "Design Patterns"],
                  ["15+", "Design Problems"],
                  ["3", "Programming Languages"],
                  ["12+", "Design Principles"]
                ].map(([number, label]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-center"
                  >
                    <div className="text-xl font-black text-blue-600">
                      {number}
                    </div>
                    <div className="mt-1 text-xs font-medium text-slate-500">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-slate-400">
                Digital products are non-refundable after purchase.
                For support: {supportEmail}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 md:grid-cols-4">
          {[
            ["OOP", "Build strong foundations"],
            ["SOLID", "Write maintainable code"],
            ["Patterns", "Design reusable solutions"],
            ["LLD", "Think like an interviewer"]
          ].map(([title, subtitle]) => (
            <div
              key={title}
              className="px-5 py-6 text-center"
            >
              <div className="font-black text-slate-950">
                {title}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {subtitle}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY LLD */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">

          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Why Low-Level Design?
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Don't just write classes.
              <span className="block text-blue-600">
                Learn how to design them.
              </span>
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              LLD is about converting requirements into clean,
              extensible and maintainable object-oriented designs.
              The goal is not to memorize patterns. The goal is to
              understand <strong>why</strong> a particular design
              makes sense for a particular problem.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Convert requirements into classes and responsibilities",
                "Identify relationships between objects",
                "Choose composition or inheritance correctly",
                "Recognize when a design pattern actually helps",
                "Handle changing business requirements",
                "Design for concurrency and thread safety",
                "Write clean, testable and extensible code",
                "Explain your design clearly during interviews"
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3"
                >
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    ✓
                  </div>

                  <p className="text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8">

            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              The LLD Mindset
            </div>

            <h3 className="mt-3 text-2xl font-black text-slate-950">
              Requirement → Design → Pattern → Code
            </h3>

            <div className="mt-7 space-y-4">
              {[
                [
                  "01",
                  "Understand",
                  "What exactly does the system need to do?"
                ],
                [
                  "02",
                  "Identify",
                  "What are the entities, responsibilities and relationships?"
                ],
                [
                  "03",
                  "Model",
                  "How should classes collaborate?"
                ],
                [
                  "04",
                  "Choose",
                  "Which principle or pattern solves the design problem?"
                ],
                [
                  "05",
                  "Code",
                  "Convert the design into clean implementation."
                ]
              ].map(([number, title, text]) => (
                <div
                  key={number}
                  className="flex gap-4 rounded-2xl border border-blue-100 bg-white p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                    {number}
                  </div>

                  <div>
                    <div className="font-bold text-slate-950">
                      {title}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* WHO SHOULD BUY */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Who Should Buy This?
            </div>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Built for developers who want to design,
              not just code
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Whether you're starting LLD or preparing for an interview,
              the book follows a progressive path from fundamentals to
              complete real-world systems.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "Complete Beginners",
                "Learn OOP, SOLID, relationships and design patterns from the ground up."
              ],
              [
                "SDE-1 Developers",
                "Build the foundation required for machine-coding and LLD interviews."
              ],
              [
                "SDE-2 Developers",
                "Improve design thinking, extensibility and trade-off discussions."
              ],
              [
                "Backend Engineers",
                "Turn business requirements into clean object-oriented services."
              ],
              [
                "Java / C++ / Python Developers",
                "See how the same design translates across programming languages."
              ],
              [
                "Interview Candidates",
                "Practice realistic LLD questions with a structured design process."
              ]
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-6 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="font-black text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEARNING PATH */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Learning Path
          </div>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Beginner → Interview Ready
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-5">
          {[
            ["01", "OOP", "Classes, objects, inheritance, abstraction and polymorphism."],
            ["02", "Principles", "SOLID, KISS, DRY, YAGNI, coupling and cohesion."],
            ["03", "Patterns", "All three pattern families and 23 GoF patterns."],
            ["04", "Concurrency", "Threads, locks, race conditions and thread-safe design."],
            ["05", "Real Systems", "15+ practical LLD interview problems."]
          ].map(([number, title, text]) => (
            <div
              key={number}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="text-sm font-black text-blue-600">
                {number}
              </div>

              <h3 className="mt-3 font-black text-slate-950">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* OOP */}
      <section className="border-y border-slate-200 bg-blue-50/50 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

          <div className="max-w-3xl">
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Foundation
            </div>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              OOP Fundamentals
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Before patterns, understand how objects should own state,
              expose behavior and collaborate with other objects.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "Encapsulation",
                "Keep state and behavior together while controlling access."
              ],
              [
                "Abstraction",
                "Expose what the object does without exposing unnecessary implementation."
              ],
              [
                "Inheritance",
                "Reuse and specialize behavior where an is-a relationship genuinely exists."
              ],
              [
                "Polymorphism",
                "Allow different implementations to be used through a common contract."
              ]
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="font-black">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {text}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SOLID */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8" id="inside">

        <div className="max-w-3xl">
          <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Design Principles
          </div>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            SOLID + KISS + DRY + YAGNI
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            The book doesn't treat design principles as definitions to
            memorize. Each principle is connected to practical design
            problems and refactoring decisions.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle, index) => (
            <div
              key={principle.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-xs font-black text-blue-600">
                PRINCIPLE {String(index + 1).padStart(2, "0")}
              </div>

              <h3 className="mt-3 font-black text-slate-950">
                {principle.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {principle.short}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ALL PATTERNS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Complete Pattern Library
            </div>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              All 23 GoF Design Patterns
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Learn the complete Creational, Structural and Behavioral
              pattern families with purpose, use cases, examples and
              implementation thinking.
            </p>
          </div>

          <div className="mt-12 space-y-12">

            {Object.entries(patterns).map(([category, items]) => (
              <div key={category}>

                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">
                      {category} Patterns
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {items.length} patterns covered
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
                    {category === "Creational"
                      ? "Object Creation"
                      : category === "Structural"
                      ? "Object Composition"
                      : "Object Behavior"}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((pattern, index) => (
                    <div
                      key={pattern.name}
                      className="group rounded-2xl border border-slate-200 bg-[#fbfdff] p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-600">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                          {category}
                        </span>
                      </div>

                      <h4 className="mt-4 text-lg font-black text-slate-950">
                        {pattern.name}
                      </h4>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {pattern.purpose}
                      </p>

                      <div className="mt-5 rounded-xl bg-blue-50 p-4">
                        <div className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                          Example
                        </div>

                        <div className="mt-1 text-sm font-semibold text-slate-700">
                          {pattern.example}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          When to use
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {pattern.when}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* PATTERN THINKING */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 lg:p-12">

          <div className="grid gap-12 lg:grid-cols-2">

            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Pattern Thinking
              </div>

              <h2 className="mt-3 text-3xl font-black text-slate-950">
                Don't force a pattern.
                <span className="block text-blue-600">
                  Let the requirement reveal it.
                </span>
              </h2>

              <p className="mt-5 leading-7 text-slate-600">
                A common LLD mistake is trying to use every design pattern
                in every problem. The book teaches you to first understand
                the requirement and then identify the design pressure.
              </p>
            </div>

            <div className="space-y-4">
              {[
                ["Changing algorithm?", "Think Strategy."],
                ["Different object creation?", "Think Factory."],
                ["Multiple subscribers?", "Think Observer."],
                ["Additional behavior?", "Think Decorator."],
                ["Object has many optional fields?", "Think Builder."],
                ["Different object states?", "Think State."],
                ["Incompatible external API?", "Think Adapter."],
                ["Multiple handlers?", "Think Chain of Responsibility."]
              ].map(([question, answer]) => (
                <div
                  key={question}
                  className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-white p-4"
                >
                  <span className="text-sm font-semibold text-slate-700">
                    {question}
                  </span>

                  <span className="shrink-0 text-sm font-black text-blue-600">
                    {answer}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* REQUIREMENTS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

          <div className="max-w-3xl">
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Start With Requirements
            </div>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Functional + Non-Functional Requirements
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Before drawing classes, understand what the system must do
              and what qualities the system must maintain.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-7">
              <h3 className="text-xl font-black text-slate-950">
                Functional Requirements
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                What should the system actually do?
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Create a booking",
                  "Cancel a booking",
                  "Reserve a seat",
                  "Send a notification",
                  "Apply a coupon",
                  "Process a payment",
                  "Update inventory",
                  "Calculate a fare"
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[#fbfdff] p-7">
              <h3 className="text-xl font-black text-slate-950">
                Non-Functional Requirements
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                How should the system behave under real conditions?
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Concurrency",
                  "Thread Safety",
                  "Performance",
                  "Scalability",
                  "Reliability",
                  "Maintainability",
                  "Extensibility",
                  "Testability",
                  "Security",
                  "Availability"
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CONCURRENCY / LOCKING */}
      <section className="border-y border-slate-200 bg-blue-50/50 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

          <div className="grid gap-12 lg:grid-cols-2">

            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Concurrency & Thread Safety
              </div>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Locking is part of LLD.
              </h2>

              <p className="mt-5 leading-7 text-slate-600">
                Real-world LLD problems often contain shared state.
                Two users may attempt the same seat, two orders may
                update the same inventory, or multiple threads may write
                to the same resource.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Race Conditions",
                  "Critical Sections",
                  "Mutex",
                  "Synchronized Blocks",
                  "Read / Write Locks",
                  "Atomic Operations",
                  "Deadlocks",
                  "Thread Safety",
                  "Optimistic Locking",
                  "Pessimistic Locking"
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">
                  Seat / Inventory Locking
                </span>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Java
                </span>
              </div>

              <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 sm:p-5 sm:text-sm sm:leading-7">
{`class Inventory {

    private final Object lock = new Object();
    private int stock = 10;

    boolean reserve(int quantity) {

        synchronized (lock) {

            if (stock < quantity)
                return false;

            stock -= quantity;

            return true;
        }
    }
}`}
              </pre>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-600">
                The book explains why the critical section exists,
                what race condition can occur without it, and how
                different locking approaches affect the design.
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* CODE SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Code-First Learning
          </div>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Design Patterns in Java, C++ & Python
          </h2>

          <p className="mx-auto mt-4 max-w-3xl leading-7 text-slate-600">
            The same design problem is explained conceptually and then
            translated into practical code across three popular
            programming languages.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {["Java", "C++", "Python"].map((item) => (
            <button
              key={item}
              onClick={() => setLanguage(item)}
              className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
                language === item
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-7">

          {codeTabs.map(([key, title]) => (
            <div
              key={key}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col items-start gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <div className="font-black text-slate-950">
                    {title}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {language} implementation
                  </div>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {language}
                </span>
              </div>

              <pre className="overflow-x-auto bg-white p-4 text-xs leading-6 text-slate-700 sm:p-6 sm:text-sm sm:leading-7">
{codeExamples[language][key]}
              </pre>
            </div>
          ))}

        </div>
      </section>

      {/* DESIGN PROCESS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

          <div className="text-center">
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Interview Framework
            </div>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              A Repeatable LLD Design Process
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Clarify Requirements", "Identify scope, actors and core use cases."],
              ["02", "Find Entities", "Extract nouns, domain objects and responsibilities."],
              ["03", "Define Relationships", "Association, aggregation, composition and inheritance."],
              ["04", "Assign Responsibilities", "Decide which class owns which behavior."],
              ["05", "Identify Changing Parts", "Find areas likely to change independently."],
              ["06", "Apply Principles", "Use SOLID, KISS, DRY and low coupling."],
              ["07", "Choose Patterns", "Use patterns only where they solve a real problem."],
              ["08", "Handle Concurrency", "Identify shared state and synchronization requirements."],
              ["09", "Write Code", "Implement interfaces, classes and collaborations."],
              ["10", "Discuss Trade-offs", "Explain alternatives and why your design works."]
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-6"
              >
                <div className="text-xs font-black text-blue-600">
                  {number}
                </div>

                <h3 className="mt-3 font-black text-slate-950">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {text}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* REAL WORLD SYSTEMS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

        <div className="max-w-3xl">
          <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Real-World Designing
          </div>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Design Systems Inspired by Real Products
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Instead of only solving artificial examples, the book uses
            familiar product domains to teach how requirements become
            classes, relationships, patterns and code.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {designQuestions.map((question, index) => (
            <div
              key={question.title}
              className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >

              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  {question.company}
                </span>

                <span className="text-xs font-bold text-slate-400">
                  LLD {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-950">
                {question.title}
              </h3>

              <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                {question.focus}
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  Design Question
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {question.thought}
                </p>
              </div>

              <div className="mt-5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Key Classes
                </div>

                <p className="mt-2 text-xs leading-6 text-slate-600">
                  {question.classes}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {question.patterns.map((pattern) => (
                  <span
                    key={pattern}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700"
                  >
                    {pattern}
                  </span>
                ))}
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* DEEP DESIGN EXAMPLE */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-700">
              Example: BookMyShow
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Movie Ticket Booking
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              A practical LLD exercise around shows, seats, users, bookings,
              payments and the most important challenge: handling concurrent
              seat reservations.
            </p>
          </div>

          <div className="mt-10 grid min-w-0 gap-6 lg:grid-cols-2 lg:items-stretch">

            <div className="min-w-0 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6 lg:p-8">
              <div className="mb-6">
                <span className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  What you'll design
                </span>

                <h3 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                  Booking System Responsibilities
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  "Identify Movie, Theatre, Screen and Show",
                  "Model individual Seat and SeatStatus",
                  "Create Booking and Payment abstractions",
                  "Define seat lifecycle",
                  "Handle temporary seat locking",
                  "Prevent duplicate booking",
                  "Calculate booking/payment amounts",
                  "Notify users after booking state changes"
                ].map((item) => (
                  <div
                    key={item}
                    className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                      ✓
                    </div>

                    <p className="min-w-0 break-words text-sm font-semibold leading-6 text-slate-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <div className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Patterns & Concepts
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {["State", "Strategy", "Observer", "Locking"].map((item) => (
                    <span
                      key={item}
                      className="max-w-full break-words rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <div className="min-w-0">
                  <div className="text-sm font-black text-slate-950">
                    Seat Locking
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Thread-safe seat state transition
                  </div>
                </div>

                <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Java
                </span>
              </div>

              <div className="min-w-0 overflow-hidden bg-white">
                <pre className="max-w-full overflow-x-auto whitespace-pre bg-slate-50 p-4 text-[11px] leading-6 text-slate-700 sm:p-6 sm:text-sm sm:leading-7">
{`class Seat {

    private SeatState state;

    public synchronized boolean lock() {

        if (state != SeatState.AVAILABLE)
            return false;

        state = SeatState.LOCKED;
        return true;
    }

    public synchronized void book() {

        if (state != SeatState.LOCKED)
            throw new IllegalStateException();

        state = SeatState.BOOKED;
    }
}`}
                </pre>
              </div>

              <div className="border-t border-slate-200 bg-blue-50/60 p-4 sm:p-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
                    ?
                  </div>

                  <h4 className="text-sm font-black text-slate-950">
                    Design Thinking
                  </h4>
                </div>

                <p className="mt-3 break-words text-sm leading-7 text-slate-600">
                  The important part is not memorizing this class. The important
                  part is recognizing that seat state changes need controlled
                  transitions and concurrency protection.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-blue-100 bg-blue-50/50 p-4 sm:p-6">
            <div className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
              Seat Lifecycle
            </div>

            <div className="mt-5 hidden items-center justify-center gap-3 sm:flex">
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700">
                AVAILABLE
              </div>
              <span className="font-black text-blue-500">→</span>
              <div className="rounded-xl border border-blue-200 bg-blue-100 px-5 py-3 text-sm font-bold text-blue-700">
                LOCKED
              </div>
              <span className="font-black text-blue-500">→</span>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700">
                BOOKED
              </div>
            </div>

            <div className="mt-5 flex flex-col items-stretch gap-2 sm:hidden">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-bold text-slate-700">
                AVAILABLE
              </div>
              <div className="text-center font-black text-blue-500">↓</div>
              <div className="rounded-xl border border-blue-200 bg-blue-100 px-4 py-3 text-center text-xs font-bold text-blue-700">
                LOCKED
              </div>
              <div className="text-center font-black text-blue-500">↓</div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-xs font-bold text-emerald-700">
                BOOKED
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* MORE REAL WORLD TOPICS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
            More Problems
          </div>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            From Machine Coding to Production Thinking
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {[
            ["Vending Machine", "State + Strategy"],
            ["ATM", "State + Chain"],
            ["Chess", "Strategy + Factory"],
            ["Tic-Tac-Toe", "OOP + Strategy"],
            ["Snake & Ladder", "Strategy + Factory"],
            ["Coffee Machine", "State + Strategy"],
            ["Elevator", "Strategy + State"],
            ["Library System", "OOP + Factory"],
            ["Hotel Booking", "State + Strategy"],
            ["Car Rental", "Factory + Strategy"],
            ["Food Delivery", "State + Observer"],
            ["Auction System", "Observer + Strategy"],
            ["Ride Sharing", "Strategy + Observer"],
            ["Shopping Cart", "Strategy + Decorator"],
            ["File System", "Composite + Iterator"],
            ["Logging System", "Chain + Singleton"]
          ].map(([title, pattern]) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <h3 className="font-black text-slate-950">
                {title}
              </h3>

              <div className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {pattern}
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* WHAT BOOK COVERS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

          <div className="grid gap-12 lg:grid-cols-2">

            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Inside The Book
              </div>

              <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                Everything You Need for LLD
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                A structured progression from object-oriented thinking
                to complete design problems and implementation.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "OOP Fundamentals",
                "Classes & Objects",
                "Association",
                "Aggregation",
                "Composition",
                "Inheritance",
                "Polymorphism",
                "Interfaces",
                "Abstract Classes",
                "SOLID",
                "KISS",
                "DRY",
                "YAGNI",
                "Coupling",
                "Cohesion",
                "Composition vs Inheritance",
                "All 23 GoF Patterns",
                "UML Thinking",
                "Class Relationships",
                "Concurrency",
                "Thread Safety",
                "Locking",
                "Race Conditions",
                "Deadlocks",
                "Functional Requirements",
                "Non-Functional Requirements",
                "Design Trade-offs",
                "Machine Coding",
                "15+ Real-World Systems",
                "Java",
                "C++",
                "Python"
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#fbfdff] p-3 text-sm font-semibold text-slate-700"
                >
                  <span className="text-blue-600">
                    ✓
                  </span>

                  {item}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* INTERVIEW QUESTIONS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:p-12">

          <div className="grid gap-12 lg:grid-cols-2">

            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Interview Preparation
              </div>

              <h2 className="mt-3 text-3xl font-black text-slate-950">
                What Will You Learn to Answer?
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                The goal is to explain your reasoning, not simply draw
                classes on a whiteboard.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Why did you create this interface?",
                "Why Strategy instead of inheritance?",
                "Why Factory instead of new?",
                "Where would you use Observer?",
                "What happens if two threads access this object?",
                "Where is the critical section?",
                "How would you make this design extensible?",
                "What changes if another payment provider is added?",
                "What happens if a new notification channel is introduced?",
                "How would you test this design?",
                "What is the responsibility of each class?",
                "Which part of the design is likely to change?"
              ].map((question) => (
                <div
                  key={question}
                  className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                >
                  {question}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

          <div className="text-center">
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              FAQ
            </div>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Frequently Asked Questions
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Everything you may want to know before getting the Low-Level
              Design ebook.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {[
              [
                "Is this only for experienced developers?",
                "No. The book starts with OOP fundamentals and gradually moves toward patterns, concurrency and complete LLD problems."
              ],
              [
                "Do I need to know all 23 patterns before interviews?",
                "The book covers all 23 GoF patterns, but the focus is on understanding when a pattern solves a real design problem rather than memorizing names."
              ],
              [
                "Are code examples included?",
                "Yes. The page and book are designed around code-first learning with examples in Java, C++ and Python."
              ],
              [
                "Does it cover SOLID?",
                "Yes. SOLID is covered along with KISS, DRY, YAGNI, composition over inheritance, coupling and cohesion."
              ],
              [
                "Does it cover concurrency?",
                "Yes. The LLD material includes race conditions, critical sections, locking, thread safety, synchronization and concurrency-oriented design."
              ],
              [
                "Does it cover real-world systems?",
                "Yes. The design problems include systems inspired by domains such as movie booking, inventory, notifications, rate limiting, logging, rail reservation, car rental, expense sharing, live scores, coupons, ride booking and payment gateways."
              ],
              [
                "Is this useful for machine-coding rounds?",
                "Yes. The design process focuses on converting requirements into classes, interfaces, relationships, patterns and implementation."
              ],
              [
                "Will the book teach High-Level Design too?",
                "This ebook is focused on Low-Level Design: object modeling, class responsibilities, relationships, design principles, patterns, concurrency and implementation."
              ],
              [
                "Which programming languages are covered?",
                "Java, C++ and Python."
              ],
              [
                "Is the digital ebook refundable?",
                "Digital ebook purchases are non-refundable after purchase."
              ]
            ].map(([question, answer], index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={question}
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-blue-200 bg-blue-50/40 shadow-sm"
                      : "border-slate-200 bg-[#fbfdff] hover:border-blue-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition ${
                          isOpen
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <span className="min-w-0 break-words text-sm font-black leading-6 text-slate-900 sm:text-base">
                        {question}
                      </span>
                    </div>

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg font-medium transition-all duration-300 ${
                        isOpen
                          ? "rotate-45 border-blue-200 bg-blue-100 text-blue-700"
                          : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      +
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-blue-100 px-4 pb-5 pt-4 sm:ml-[52px] sm:px-5">
                        <p className="text-sm leading-7 text-slate-600">
                          {answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

        <div className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-5 text-slate-900 shadow-sm sm:p-8 lg:p-14">

          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">

            <div>
              <div className="inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-black text-blue-700">
                START YOUR LLD JOURNEY
              </div>

              <h2 className="mt-5 max-w-3xl text-3xl font-black sm:text-4xl">
                Stop memorizing interview answers.
                Start learning how to design.
              </h2>

              <p className="mt-5 max-w-2xl leading-7 text-slate-600">
                Learn OOP, SOLID, all 23 design patterns, concurrency,
                locking and real-world LLD problems with Java, C++ and
                Python examples.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                <span>✓ 23 Design Patterns</span>
                <span>✓ 15+ Design Problems</span>
                <span>✓ Java</span>
                <span>✓ C++</span>
                <span>✓ Python</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 text-slate-950 shadow-xl lg:min-w-[290px]">

              <div className="text-sm font-bold text-slate-500">
                Digital Ebook
              </div>

              <div className="mt-2 flex items-end gap-3">
                <span className="text-4xl font-black">
                  {formatMoney(currentPrice)}
                </span>

                {mrp > currentPrice && (
                <span className="pb-1 text-lg text-slate-400 line-through">
                  {formatMoney(mrp)}
                </span>
                )}
              </div>

              {discount > 0 && (
                <div className="mt-2 text-sm font-bold text-blue-600">
                  Save {discount}% today
                </div>
              )}

              <button
                onClick={handleBuyNow}
                disabled={!product?._id}
                className="mt-5 w-full rounded-xl bg-blue-600 px-6 py-4 font-black text-white transition hover:bg-blue-700"
              >
                Get the Ebook →
              </button>

              <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                Non-refundable digital product.
              </p>

            </div>

          </div>

        </div>

        <div className="mt-6 text-center text-xs leading-5 text-slate-400">
          Need help? Contact {supportEmail}
          <br />
          Digital products are non-refundable after purchase.
        </div>

      </section>


      <PayUCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        product={product}
      />
    </div>
  );
}
